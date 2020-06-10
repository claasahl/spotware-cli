import * as T from "./types"
import { bullish, bearish, range } from "indicators"

function engulfed(candleA: T.TrendbarEvent, candleB: T.TrendbarEvent): boolean {
  const upperA = candleA.high;
  const lowerA = candleA.low;
  const upperB = candleB.high;
  const lowerB = candleB.low;
  return (
    (upperA >= upperB && lowerA < lowerB) ||
    (upperA > upperB && lowerA <= lowerB)
  );
}

function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

interface PlaceOrderProps {
  id: string,
  symbol: T.Symbol,
  enter: T.Price,
  tradeSide: T.TradeSide,
  volume: T.Volume,
  stopLoss: T.Price,
  takeProfit: T.Price,
  account: T.AccountStream,
  expiresAt?: T.Timestamp
}
function placeOrder(props: PlaceOrderProps): T.OrderStream<T.StopOrderProps> {
  const { account, ...rest } = props;
  const order = account.stopOrder(rest);
  const guard = (e: T.OrderProfitLossEvent) => {
    if (props.tradeSide === "BUY" && (e.price >= props.takeProfit || e.price <= props.stopLoss)) {
      order.closeOrder();
    } else if (props.tradeSide === "SELL" && (e.price <= props.takeProfit || e.price >= props.stopLoss)) {
      order.closeOrder();
    }
  }
  order.on("data", e => {
    if(e.type === "PROFITLOSS") {
      guard(e);  
    }
  });
  return order;
}

function endLastOrder(lastOrder: T.OrderStream<T.StopOrderProps> | undefined, cb: (err?: Error) => void): void {
  if (lastOrder) {
    lastOrder.once("error", err => cb(err));
    lastOrder.once("end", () => cb());
    lastOrder.endOrder();
  } else {
    cb();
  }
}

export interface Props {
  account: T.AccountStream,
  period: T.Period,
  symbol: T.Symbol,
  enterOffset: T.Price,
  stopLossOffset: T.Price,
  takeProfitOffset: T.Price,
  minTrendbarRange: T.Price,
  volume: T.Volume,
  expiresIn?: number
}

export async function insideBarMomentumStrategy(props: Props): Promise<T.AccountStream> {
  const { account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn } = props
  const trendbars = account.trendbars({ period, symbol })
  let id = 1;

  let lastOrder: T.OrderStream<T.StopOrderProps> | undefined = undefined;
  const placeBuyOrder = (timestamp: T.Timestamp, enter: T.Price, stopLoss: T.Price, takeProfit: T.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "BUY", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })
  const placeSellOrder = (timestamp: T.Timestamp, enter: T.Price, stopLoss: T.Price, takeProfit: T.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "SELL", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })

  const trendbarEvents: T.TrendbarEvent[] = []
  trendbars.on("data", e => {
    trendbarEvents.push(e);
    if (trendbarEvents.length >= 2) {
      const first = trendbarEvents.shift()!;
      const second = trendbarEvents[0];
      const r = range(first);
      if (r < minTrendbarRange) {
        // no good. if this trendbar is used to calculate stopLoss and takeProfit levels, then chance are high that the current spot price is too close to these levels.
      } else if (bullish(first) && engulfed(first, second)) {
        const enter = roundPrice(first.high + r * enterOffset);
        const stopLoss = roundPrice(first.high - r * stopLossOffset);
        const takeProfit = roundPrice(first.high + r * takeProfitOffset);
        endLastOrder(lastOrder, err => {
          if(!err) {
            lastOrder = placeBuyOrder(e.timestamp+period, enter, stopLoss, takeProfit)
          }
        });
      } else if (bearish(first) && engulfed(first, second)) {
        const enter = roundPrice(first.low - r * enterOffset);
        const stopLoss = roundPrice(first.low + r * stopLossOffset);
        const takeProfit = roundPrice(first.low - r * takeProfitOffset);
        endLastOrder(lastOrder, err => {
          if(!err) {
            lastOrder = placeSellOrder(e.timestamp+period, enter, stopLoss, takeProfit)
          }
        });
      }
    }
  })
  return account;
}