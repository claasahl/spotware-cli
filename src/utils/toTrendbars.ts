import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { map, scan, pairwise, filter } from "rxjs/operators";

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
