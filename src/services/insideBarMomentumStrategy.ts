import { fromNothing } from "./local"

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
  account: B.AccountStream
}
let lastOrder: B.OrderStream<B.StopOrderProps> | null = null
function placeOrder(props: PlaceOrderProps) {
  if (lastOrder) {
    lastOrder.end()
  }
  const { account, ...rest } = props;
  const order = account.stopOrder(rest)
  lastOrder = order;
}

export interface Props {
  currency: B.Currency,
  initialBalance: B.Price,
  period: B.Period,
  symbol: B.Symbol,
  enterOffset: B.Price,
  stopLossOffset: B.Price,
  takeProfitOffset: B.Price,
  minTrendbarRange: B.Price,
  volume: B.Volume,
  spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
}

export function insideBarMomentumStrategy(props: Props): B.AccountStream {
  const { currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots } = props
  const account = fromNothing({ currency, initialBalance, spots })
  const trendbars = account.trendbars({ period, symbol })
  let id = 1

  const placeBuyOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "BUY", volume, stopLoss, takeProfit, account })
  const placeSellOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ id: `${id++}`, symbol, enter, tradeSide: "SELL", volume, stopLoss, takeProfit, account })

  const trendbarEvents: B.TrendbarEvent[] = []
  trendbars.on("trendbar", e => {
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
        placeBuyOrder(enter, stopLoss, takeProfit)
      } else if (bearish(first) && engulfed(first, second)) {
        const enter = roundPrice(first.low - r * enterOffset);
        const stopLoss = roundPrice(first.low + r * stopLossOffset);
        const takeProfit = roundPrice(first.low - r * takeProfitOffset);
        placeSellOrder(enter, stopLoss, takeProfit)
      }
      trendbarEvents.shift()
    }
  })
  return account;
}