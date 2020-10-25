import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { bufferedTrendbars } from "./trendbar";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export function WilliamsPercentRange(options: Options) {
  const buffered = bufferedTrendbars(options);
  return (message: Messages) => {
    const { bars } = buffered(message);
    if (bars.length !== options.periods) {
      return undefined;
    }
    let high = Number.MIN_SAFE_INTEGER;
    let low = Number.MAX_SAFE_INTEGER;
    for (const bar of bars) {
      high = Math.max(bar.high, high);
      low = Math.min(bar.low, low);
    }
    const current = bars[bars.length - 1].close;
    return ((high - current) / (high - low)) * -100;
  };
}
