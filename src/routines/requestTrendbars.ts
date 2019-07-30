import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe, interval } from "rxjs";
import { map, mergeMap, filter } from "rxjs/operators";

import util from "../util";

export function requestTrendbars(
  payload: Omit<$.ProtoOAGetTrendbarsReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2137> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.getTrendbars({ ...payload, ctidTraderAccountId })
    )
  );
}

export function requestLastTrendbars(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  > & { trendbars: number }
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2137> {
  const toTimestamp = new Date().getTime();
  const fromTimestamp =
    toTimestamp - util.periodToMillis(payload.period) * payload.trendbars;
  return requestTrendbars({ ...payload, fromTimestamp, toTimestamp });
}

function newTrendbarExpected(
  period: $.ProtoOATrendbarPeriod,
  slack: number = 30000
): boolean {
  const millis = util.periodToMillis(period);
  const now = Date.now();
  return now % millis <= slack;
}

export function pollLatestTrendbar(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  >
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2137> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    mergeMap(ctidTraderAccountId =>
      interval(10000).pipe(
        filter(() => newTrendbarExpected(payload.period)),
        map(() => {
          const date = new Date();
          date.setMilliseconds(0);
          date.setSeconds(0);
          const toTimestamp = date.getTime();
          const fromTimestamp =
            toTimestamp - util.periodToMillis(payload.period);
          return util.getTrendbars({
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
