import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { bufferedTrendbars, Trendbar } from "./trendbar";

interface SmaOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
  property?: keyof Trendbar;
}
export function sma(options: SmaOptions) {
  const buffer = bufferedTrendbars(options);
  const prop: keyof Trendbar = options.property || "close";
  let sum = 0;
  return (msg: Messages): number | undefined => {
    const { bars, added, removed } = buffer(msg);
    sum += added.reduce((prev, curr) => prev + curr[prop], 0);
    sum -= removed.reduce((prev, curr) => prev + curr[prop], 0);
    if (bars.length !== options.periods) {
      return undefined;
    }
    return Math.round(sum / options.periods);
  };
}
