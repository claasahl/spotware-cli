import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { bufferedTrendbars } from "./trendbar";

interface SmaOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export function sma(options: SmaOptions) {
  const buffer = bufferedTrendbars(options);
  let sum = 0;
  return (msg: Messages): number | undefined => {
    const { bars, added, removed } = buffer(msg);
    sum += added.reduce((prev, curr) => prev + curr.close, 0);
    sum -= removed.reduce((prev, curr) => prev + curr.close, 0);
    if (bars.length !== options.periods) {
      return undefined;
    }
    return Math.round(sum / options.periods);
  };
}
