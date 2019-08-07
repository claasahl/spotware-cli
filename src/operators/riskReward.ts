import { OperatorFunction, pipe } from "rxjs";
import { scan, map } from "rxjs/operators";
import ms = require("ms");

import { Trendbar } from "../types";

export interface RiskReward {
  duration: string;
  durationMS: number;
  low: number;
  high: number;
  ratio_buy: number;
  ratio_sell: number;
}

export function riskReward(
  referencePrice: number,
  referenceTimestamp: number
): OperatorFunction<Trendbar, RiskReward> {
  return pipe(
    scan(
      (acc, curr) => ({
        timestamp: curr.timestamp,
        high: Math.max(acc.high, curr.high),
        low: Math.min(acc.low, curr.low)
      }),
      {
        timestamp: referenceTimestamp,
        low: referencePrice,
        high: referencePrice
      }
    ),
    map(value => {
      const low = value.low - referencePrice;
      const high = value.high - referencePrice;
      return {
        duration: ms(value.timestamp - referenceTimestamp),
        durationMS: value.timestamp - referenceTimestamp,
        low,
        high,
        ratio_buy: Math.abs(high / low),
        ratio_sell: Math.abs(low / high)
      };
    })
  );
}
