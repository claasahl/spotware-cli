import {
  Messages,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import { bullish, bearish, range } from "indicators";
import { bufferedTrendbars, Trendbar } from "./trendbar";

function engulfed(candleA: Trendbar, candleB: Trendbar): boolean {
  const upperA = candleA.high;
  const lowerA = candleA.low;
  const upperB = candleB.high;
  const lowerB = candleB.low;
  return (
    (upperA >= upperB && lowerA < lowerB) ||
    (upperA > upperB && lowerA <= lowerB)
  );
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  enterOffset: number;
  stopLossOffset: number;
  takeProfitOffset: number;
}
export function insideBarMomentum(options: Options) {
  const buffered = bufferedTrendbars({
    ...options,
    periods: 3,
  });
  let lastTimestamp = 0;
  return (msg: Messages) => {
    const { bars } = buffered(msg);
    if (bars.length !== 3) {
      return;
    } else if (lastTimestamp >= bars[0].timestamp) {
      return;
    }
    const first = bars[0];
    const second = bars[1];
    const r = range(first);
    lastTimestamp = first.timestamp;
    if (bullish(first) && engulfed(first, second)) {
      const enter = Math.round(first.high + r * options.enterOffset);
      const stopLoss = Math.round(first.high - r * options.stopLossOffset);
      const takeProfit = Math.round(first.high + r * options.takeProfitOffset);
      return { enter, stopLoss, takeProfit, tradeSide: ProtoOATradeSide.BUY };
    } else if (bearish(first) && engulfed(first, second)) {
      const enter = Math.round(first.low - r * options.enterOffset);
      const stopLoss = Math.round(first.low + r * options.stopLossOffset);
      const takeProfit = Math.round(first.low - r * options.takeProfitOffset);
      return { enter, stopLoss, takeProfit, tradeSide: ProtoOATradeSide.SELL };
    }
  };
}
