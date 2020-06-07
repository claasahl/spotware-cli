import * as B from "./base"
import { bullish, bearish, range } from "indicators"

function engulfed(candleA: B.TrendbarEvent, candleB: B.TrendbarEvent): boolean {
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
  symbol: B.Symbol,
  enter: B.Price,
  tradeSide: B.TradeSide,
  volume: B.Volume,
  stopLoss: B.Price,
  takeProfit: B.Price,
  account: B.AccountStream,
  expiresAt?: B.Timestamp
}
function placeOrder(props: PlaceOrderProps): B.OrderStream<B.StopOrderProps> {
  const { account, ...rest } = props;
  const order = account.stopOrder(rest);
  const guard = (e: B.OrderProfitLossEvent) => {
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

function endLastOrder(lastOrder: B.OrderStream<B.StopOrderProps> | undefined, cb: (err?: Error) => void): void {
  if (lastOrder) {
    lastOrder.once("error", err => cb(err));
    lastOrder.once("end", () => cb());
    lastOrder.endOrder();
  } else {
    cb();
  }
}

export interface Props {
  account: B.AccountStream,
  period: B.Period,
  symbol: B.Symbol,
  enterOffset: B.Price,
  stopLossOffset: B.Price,
  takeProfitOffset: B.Price,
  minTrendbarRange: B.Price,
  volume: B.Volume,
  expiresIn?: number
}

export async function insideBarMomentumStrategy(props: Props): Promise<B.AccountStream> {
  const { account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn } = props
  const trendbars = account.trendbars({ period, symbol })
  let id = 1;

  let lastOrder: B.OrderStream<B.StopOrderProps> | undefined = undefined;
  const placeBuyOrder = (timestamp: B.Timestamp, enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "BUY", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })
  const placeSellOrder = (timestamp: B.Timestamp, enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "SELL", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })

  const trendbarEvents: B.TrendbarEvent[] = []
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