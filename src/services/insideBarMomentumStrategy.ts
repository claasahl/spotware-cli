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
  const { account, ...rest } = props;
  const order = account.stopOrder({ ...rest, id: "1" })
  if (lastOrder) {
    lastOrder.end()
  }
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

  const placeBuyOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ symbol, enter, tradeSide: "BUY", volume, stopLoss, takeProfit, account })
  const placeSellOrder = (enter: B.Price, stopLoss: B.Price, takeProfit: B.Price) => placeOrder({ symbol, enter, tradeSide: "SELL", volume, stopLoss, takeProfit, account })

  const trendbarEvents: B.TrendbarEvent[] = []
  trendbars.on("trendbar", e => {
    trendbarEvents.push(e);
    if (trendbarEvents.length >= 2) {
      const [first, second] = trendbarEvents;
      const r = range(first);
      if (r < minTrendbarRange) {
        // no good. if this trendbar is used to calculate stopLoss and takeProfit level, then chance are high that the current spot price is too close to these levels.
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