import { OperatorFunction, pipe } from "rxjs";
import { bufferCount, map } from "rxjs/operators";

import { Trendbar } from "../types";

export function SimpleMovingAverage(
  period: number
): OperatorFunction<Trendbar, Trendbar> {
  return pipe(
    bufferCount(period, 1),
    map(trendbars => {
      const open = Math.round(
        trendbars.reduce((prev, curr) => prev + curr.open, 0) / period
      );
      const high = Math.round(
        trendbars.reduce((prev, curr) => prev + curr.high, 0) / period
      );
      const low = Math.round(
        trendbars.reduce((prev, curr) => prev + curr.low, 0) / period
      );
      const close = Math.round(
        trendbars.reduce((prev, curr) => prev + curr.close, 0) / period
      );
      const volume = Math.round(
        trendbars.reduce((prev, curr) => prev + curr.volume, 0) / period
      );
      return {
        open,
        high,
        low,
        close,
        volume,
        period: trendbars[0].period,
        timestamp: trendbars[0].timestamp,
        date: trendbars[0].date
      };
    })
  );
}
