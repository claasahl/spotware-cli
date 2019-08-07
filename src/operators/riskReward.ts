import { OperatorFunction, pipe } from "rxjs";
import { scan, map } from "rxjs/operators";

import { Trendbar } from "../types";

export interface RiskReward {
  risk: number;
  reward: number;
  ratio: number;
}

export function riskReward(
  reference: number
): OperatorFunction<Trendbar, RiskReward> {
  return pipe(
    scan(
      (acc, curr) => ({
        reward: Math.max(acc.reward, curr.high),
        risk: Math.min(acc.risk, curr.low)
      }),
      { risk: reference, reward: reference }
    ),
    map(value => ({
      risk: value.risk - reference,
      reward: value.reward - reference
    })),
    map(value => ({ ...value, ratio: Math.abs(value.reward / value.risk) }))
  );
}
