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
async function placeOrder(props: PlaceOrderProps): Promise<B.OrderStream<B.StopOrderProps>> {
  const { account, ...rest } = props;
  const order = await account.stopOrder(rest);
  const guard = (e: B.OrderProfitLossEvent) => {
    if (props.tradeSide === "BUY" && (e.price >= props.takeProfit || e.price <= props.stopLoss)) {
      order.close();
    } else if (props.tradeSide === "SELL" && (e.price <= props.takeProfit || e.price >= props.stopLoss)) {
      order.close();
    }
  }
  order.on("data", e => {
    if(e.type === "PROFITLOSS") {
      guard(e);  
    }
  });
  return order;
}

async function endLastOrder(lastOrder?: B.OrderStream<B.StopOrderProps>): Promise<void> {
  if (lastOrder) {
    await lastOrder.end();
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
  const trendbars = await account.trendbars({ period, symbol })
  let id = 1, timestamp = 0;

  const spots = await account.spotPrices({ symbol })
  spots.on("ask", e => timestamp = e.timestamp);
  spots.on("bid", e => timestamp = e.timestamp);

  let lastOrder: B.OrderStream<B.StopOrderProps> | undefined = undefined;
  const placeBuyOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "BUY", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })
  const placeSellOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "SELL", volume, stopLoss, takeProfit, account, expiresAt: expiresIn ? timestamp + expiresIn : undefined })

  const trendbarEvents: B.TrendbarEvent[] = []
  trendbars.on("trendbar", async e => {
    trendbarEvents.push(e);
    if (trendbarEvents.length >= 2) {
      const [first, second] = trendbarEvents;
      const r = range(first);
      if (r < minTrendbarRange) {
        // no good. if this trendbar is used to calculate stopLoss and takeProfit levels, then chance are high that the current spot price is too close to these levels.
      } else if (bullish(first) && engulfed(first, second)) {
        const enter = roundPrice(first.high + r * enterOffset);
        const stopLoss = roundPrice(first.high - r * stopLossOffset);
        const takeProfit = roundPrice(first.high + r * takeProfitOffset);
        await endLastOrder(lastOrder);
        lastOrder = await placeBuyOrder(enter, stopLoss, takeProfit)
      } else if (bearish(first) && engulfed(first, second)) {
        const enter = roundPrice(first.low - r * enterOffset);
        const stopLoss = roundPrice(first.low + r * stopLossOffset);
        const takeProfit = roundPrice(first.low - r * takeProfitOffset);
        await endLastOrder(lastOrder);
        lastOrder = await placeSellOrder(enter, stopLoss, takeProfit)
      }
      trendbarEvents.shift()
    }
  })
  return account;
}