import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe, interval } from "rxjs";
import { map, mergeMap, filter } from "rxjs/operators";

import { pm2137, periodToMillis } from "../utils";

export function requestTrendbars(
  payload: Omit<$.ProtoOAGetTrendbarsReq, "ctidTraderAccountId">
): OperatorFunction<number, $.ProtoMessage2137> {
  return pipe(
    map(ctidTraderAccountId => pm2137({ ...payload, ctidTraderAccountId }))
  );
}

export function requestLastTrendbars(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  > & { trendbars: number }
): OperatorFunction<number, $.ProtoMessage2137> {
  const toTimestamp = new Date().getTime();
  const fromTimestamp =
    toTimestamp - periodToMillis(payload.period) * payload.trendbars;
  return requestTrendbars({ ...payload, fromTimestamp, toTimestamp });
}

function newTrendbarExpected(
  period: $.ProtoOATrendbarPeriod,
  slack: number = 30000
): boolean {
  const millis = periodToMillis(period);
  const now = Date.now();
  return now % millis <= slack;
}

export function pollLatestTrendbar(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  >
): OperatorFunction<number, $.ProtoMessage2137> {
  return pipe(
    mergeMap(ctidTraderAccountId =>
      interval(10000).pipe(
        filter(() => newTrendbarExpected(payload.period)),
        map(() => {
          const date = new Date();
          date.setMilliseconds(0);
          date.setSeconds(0);
          const toTimestamp = date.getTime();
          const fromTimestamp = toTimestamp - periodToMillis(payload.period);
          return pm2137({
            ...payload,
            ctidTraderAccountId,
            fromTimestamp,
            toTimestamp
          });
        })
      )
    )
  );
}
