import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { bufferedTrendbars, Trendbar } from "./trendbar";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export function atr(options: Options) {
  const buffer = bufferedTrendbars(options);
  const prop = (curr: Trendbar, prev?: Trendbar) => {
    const range = curr.high - curr.low;
    if (prev) {
      const highGap = Math.abs(curr.high - prev.close);
      const lowGap = Math.abs(curr.low - prev.close);
      return Math.max(range, highGap, lowGap);
    }
    return range;
  };
  let sum = 0;
  return (msg: Messages): number | undefined => {
    const { bars, added, removed } = buffer(msg);
    sum += added.reduce(
      (prev, curr, index, array) => prev + prop(curr, array[index - 1]),
      0
    );
    sum -= removed.reduce(
      (prev, curr, index, array) => prev + prop(curr, array[index - 1]),
      0
    );
    if (bars.length !== options.periods) {
      return undefined;
    }
    return Math.round(sum / options.periods);
  };
}
