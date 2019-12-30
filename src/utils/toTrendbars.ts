import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe, timer, from } from "rxjs";
import {
  map,
  scan,
  pairwise,
  filter,
  reduce,
  withLatestFrom,
  skipUntil,
  flatMap
} from "rxjs/operators";

import { Spot, Trendbar } from "../types";
import periodToMillis from "./periods";

export function toTrendbars(
  period: ProtoOATrendbarPeriod
): OperatorFunction<Spot, Trendbar> {
  return pipe(
    map(spot => ({ ...spot, periodStart: periodStart(spot.date, period) })),
    scan(
      (acc, curr) => {
        const price = curr.bid;
        if (acc.date.getTime() === curr.periodStart.getTime()) {
          const trendbar = { ...acc };
          trendbar.close = price;
          if (trendbar.high < price) {
            trendbar.high = price;
          }
          if (trendbar.low > price) {
            trendbar.low = price;
          }
          return trendbar;
        } else {
          return {
            date: curr.periodStart,
            timestamp: curr.periodStart.getTime(),
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0,
            period
          };
        }
      },
      {
        date: new Date(0),
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        period
      }
    ),
    pairwise(),
    filter(([left, right]) => left.timestamp !== right.timestamp),
    map(([left, _right]) => left)
  );
}

function periodStart(date: Date, period: ProtoOATrendbarPeriod): Date {
  const timestamp = date.getTime();
  const millis = periodToMillis(period);
  const periodStart = Math.floor(timestamp / millis) * millis;
  return new Date(periodStart);
}

export function toSlidingTrendbars(
  period: ProtoOATrendbarPeriod
): OperatorFunction<Spot, Trendbar[]> {
  const millis = periodToMillis(period);
  const timeframe = millis * 2;
  function withinTimeframe(spot: Spot) {
    const lowerBound = Date.now() - timeframe;
    const timestamp = spot.date.getTime();
    return timestamp >= lowerBound;
  }
  function withinBucket1(spot: Spot) {
    const lowerBound = Date.now() - millis * 2;
    const upperBound = Date.now() - millis * 1;
    const timestamp = spot.date.getTime();
    return timestamp >= lowerBound && timestamp < upperBound;
  }
  function withinBucket2(spot: Spot) {
    const lowerBound = Date.now() - millis;
    const timestamp = spot.date.getTime();
    return timestamp >= lowerBound;
  }
  function spotToTrendbar(): OperatorFunction<Spot, Trendbar> {
    return pipe(
      reduce(
        (acc, curr) => {
          const price = curr.bid;
          if (acc.timestamp) {
            const trendbar = { ...acc };
            trendbar.close = price;
            if (trendbar.high < price) {
              trendbar.high = price;
            }
            if (trendbar.low > price) {
              trendbar.low = price;
            }
            return trendbar;
          } else {
            return {
              date: curr.date,
              timestamp: curr.date.getTime(),
              open: price,
              high: price,
              low: price,
              close: price,
              volume: 0,
              period
            };
          }
        },
        {
          date: new Date(0),
          timestamp: 0,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
          period
        }
      )
    );
  }
  return pipe(
    scan((acc, curr) => [...acc, curr].filter(withinTimeframe), [] as Spot[]),
    skipUntil(timer(timeframe)),
    flatMap(spots => {
      const bucket1 = from(spots.filter(withinBucket1)).pipe(spotToTrendbar());
      const bucket2 = from(spots.filter(withinBucket2)).pipe(spotToTrendbar());
      return bucket1.pipe(withLatestFrom(bucket2));
    })
  );
}
