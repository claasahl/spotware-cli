import * as $ from "@claasahl/spotware-adapter";
import { Observable, of, merge } from "rxjs";
import {
  filter,
  flatMap,
  pairwise,
  distinctUntilChanged
} from "rxjs/operators";

import { Trendbar, when, trendbar } from "../operators";
import { pollLatestTrendbar } from "../routines/requestTrendbars";
import { subscribeTrendbars } from "../routines/subscribeTrendbars";
import { periodToMillis, pm2127, pm2137 } from "../utils";

function requestLastTrendbars(
  payload: Omit<$.ProtoOAGetTrendbarsReq, "fromTimestamp" | "toTimestamp"> & {
    trendbars: number;
  }
): $.ProtoMessage2137 {
  const toTimestamp = new Date().getTime();
  const fromTimestamp =
    toTimestamp - periodToMillis(payload.period) * payload.trendbars;
  return pm2137({ ...payload, fromTimestamp, toTimestamp });
}

export function trendbars(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  ctidTraderAccountId: number,
  symbolId: number,
  period: $.ProtoOATrendbarPeriod,
  trendbars: number
): Observable<Trendbar> {
  const subscribe = of(pm2127({ symbolId: [symbolId], ctidTraderAccountId }));
  const fetchTrendbars = of(
    requestLastTrendbars({ period, symbolId, ctidTraderAccountId, trendbars })
  );
  const pollTrendbars = of(ctidTraderAccountId).pipe(
    pollLatestTrendbar({ period, symbolId })
  );
  merge(subscribe, fetchTrendbars, pollTrendbars).subscribe(output);

  // PROTO_OA_SUBSCRIBE_SPOTS_RES ->
  const SUBSCRIBE_SPOTS_RES = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES)
  );
  SUBSCRIBE_SPOTS_RES.pipe(subscribeTrendbars({ symbolId, period })).subscribe(
    output
  );

  const historic = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
    filter(pm => pm.payload.symbolId === symbolId),
    filter(pm => pm.payload.period === period),
    flatMap(pm => pm.payload.trendbar),
    trendbar()
  );
  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    flatMap(pm => pm.payload.trendbar),
    filter(trendbar => trendbar.period === period),
    trendbar()
  );
  const latestClosedTrendbar = live.pipe(
    pairwise(),
    filter(([a, b]) => a.timestamp !== b.timestamp),
    flatMap(([a, _b]) => of(a))
  );
  return merge(historic, latestClosedTrendbar).pipe(
    distinctUntilChanged((x, y) => x.timestamp === y.timestamp)
  );
}
