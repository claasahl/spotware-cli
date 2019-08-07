import { OperatorFunction, pipe } from "rxjs";
import { scan, map } from "rxjs/operators";
import ms = require("ms");

import { Trendbar } from "../types";

export interface RiskReward {
  duration: string;
  durationMS: number;
  risk: number;
  reward: number;
  ratio: number;
}

export function riskReward(
  referencePrice: number,
  referenceTimestamp: number
): OperatorFunction<Trendbar, RiskReward> {
  return pipe(
    scan(
      (acc, curr) => ({
        timestamp: curr.timestamp,
        reward: Math.max(acc.reward, curr.high),
        risk: Math.min(acc.risk, curr.low)
      }),
      {
        timestamp: referenceTimestamp,
        risk: referencePrice,
        reward: referencePrice
      }
    ),
    map(value => ({
      duration: ms(value.timestamp - referenceTimestamp),
      durationMS: value.timestamp - referenceTimestamp,
      risk: value.risk - referencePrice,
      reward: value.reward - referencePrice
    })),
    map(value => ({ ...value, ratio: Math.abs(value.reward / value.risk) }))
  );
}
