import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { bufferedTrendbars, Trendbar } from "./trendbar";
import { period } from "./period";

const dailyPeriod = ProtoOATrendbarPeriod.D1;
const intraDayPeriod = ProtoOATrendbarPeriod.M1;
const threshold = period(dailyPeriod);

interface VwapOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  property?: (bar: Trendbar) => number;
}
export function vwap(options: VwapOptions) {
  const daily = bufferedTrendbars({
    ...options,
    period: dailyPeriod,
    periods: 1,
  });
  const intraDay = bufferedTrendbars({
    ...options,
    period: intraDayPeriod,
    periods: (bar) =>
      data.referenceTimestamp === 0 ||
      (data.referenceTimestamp - bar.timestamp <= threshold &&
        data.referenceTimestamp <= bar.timestamp),
  });
  const prop = options.property || ((bar: Trendbar) => bar.close);
  const data = {
    accumulatedPriceVolume: 0,
    accumulatedVolume: 0,
    referenceTimestamp: 0,
  };
  return (msg: Messages): number | undefined => {
    const today = daily(msg);
    if (today.bars.length > 0) {
      const last = today.bars.length - 1;
      data.referenceTimestamp = today.bars[last].timestamp;
    }

    const { bars, added, removed } = intraDay(msg);
    data.accumulatedPriceVolume += added.reduce(
      (prev, curr) => prev + prop(curr) * curr.volume,
      0
    );
    data.accumulatedVolume += added.reduce(
      (prev, curr) => prev + curr.volume,
      0
    );
    data.accumulatedPriceVolume -= removed.reduce(
      (prev, curr) => prev + prop(curr) * curr.volume,
      0
    );
    data.accumulatedVolume -= removed.reduce(
      (prev, curr) => prev + curr.volume,
      0
    );
    if (bars.length === 0) {
      return undefined;
    }
    return Math.round(data.accumulatedPriceVolume / data.accumulatedVolume);
  };
}
