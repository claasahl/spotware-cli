import * as $ from "@claasahl/spotware-adapter";
import { Observable, of, merge } from "rxjs";
import {
  filter,
  flatMap,
  pairwise,
  distinctUntilChanged
} from "rxjs/operators";

import { Trendbar, when, trendbar } from "../operators";
import { subscribeSpots } from "../routines/subscribeSpots";
import {
  requestLastTrendbars,
  pollLatestTrendbar
} from "../routines/requestTrendbars";
import { subscribeTrendbars } from "../routines/subscribeTrendbars";

export function trendbars(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  symbolId: number,
  period: $.ProtoOATrendbarPeriod,
  trendbars: number
): Observable<Trendbar> {
  // PROTO_OA_ACCOUNT_AUTH_RES ->
  const ACCOUNT_AUTH_RES = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES)
  );
  ACCOUNT_AUTH_RES.pipe(subscribeSpots({ symbolId: [symbolId] })).subscribe(
    output
  );
  ACCOUNT_AUTH_RES.pipe(
    requestLastTrendbars({ period, symbolId, trendbars })
  ).subscribe(output);
  ACCOUNT_AUTH_RES.pipe(pollLatestTrendbar({ period, symbolId })).subscribe(
    output
  );

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
