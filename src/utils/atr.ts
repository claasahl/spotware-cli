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
  return (msg: Messages): number | undefined => {
    const { bars } = buffer(msg);
    if (bars.length !== options.periods) {
      return undefined;
    }
    const sum = bars.reduce((prev, curr, index, array) => {
      if (index === 0) {
        return 0;
      }
      const prevBar = array[index - 1];
      if (prevBar) {
        const range = curr.high - curr.low;
        const highGap = Math.abs(curr.high - prevBar.close);
        const lowGap = Math.abs(curr.low - prevBar.close);
        return prev + Math.max(range, highGap, lowGap);
      }
      return prev + curr.high - curr.low;
    }, 0);
    return Math.round(sum / options.periods);
  };
}
