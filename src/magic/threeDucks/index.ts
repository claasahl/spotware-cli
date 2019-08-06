import * as $ from "@claasahl/spotware-adapter";
import { Observable, combineLatest, concat, of, merge } from "rxjs";
import {
  filter,
  map,
  tap,
  toArray,
  flatMap,
  first,
  distinctUntilChanged,
  pairwise,
  last
} from "rxjs/operators";

import { when, validSnapshot, trendbar } from "../../operators";
import { signals } from "./signals";
import { tradeStrategy } from "./tradeStrategy";
import { snapshots as snapshotz } from "../../experiments/snapshots";
import { pm2137, periodToMillis, pm2127, pm2135 } from "../../utils";
import { pollLatestTrendbar } from "../../routines";
import { Trendbar } from "../../types";

function historic(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  payload: $.ProtoOAGetTrendbarsReq
) {
  const request = of(pm2137(payload));
  const historic = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
    filter(pm => pm.payload.symbolId === payload.symbolId),
    filter(pm => pm.payload.period === payload.period),
    first(),
    flatMap(pm => pm.payload.trendbar),
    trendbar(payload.period)
  );
  return request.pipe(
    tap(output),
    flatMap(() => historic),
    toArray()
  );
}

function liveTrendbars(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  ctidTraderAccountId: number,
  symbolId: number,
  period: $.ProtoOATrendbarPeriod
): Observable<Trendbar> {
  const request = of(pm2135({ symbolId, period, ctidTraderAccountId }));
  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    flatMap(pm => pm.payload.trendbar),
    filter(trendbar => trendbar.period === period),
    trendbar(period)
  );
  const latestClosedTrendbar = live.pipe(
    pairwise(),
    filter(([a, b]) => a.timestamp !== b.timestamp),
    flatMap(([a, _b]) => of(a))
  );
  return request.pipe(
    tap(output),
    flatMap(() => latestClosedTrendbar)
  );
}

function polledTrendbars(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  ctidTraderAccountId: number,
  symbolId: number,
  period: $.ProtoOATrendbarPeriod
): Observable<Trendbar> {
  const request = of(ctidTraderAccountId).pipe(
    pollLatestTrendbar({ period, symbolId })
  );
  const historic = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
    filter(pm => pm.payload.symbolId === symbolId),
    filter(pm => pm.payload.period === period),
    flatMap(pm => pm.payload.trendbar),
    trendbar(period)
  );
  return request.pipe(
    tap(output),
    flatMap(() => historic)
  );
}

export function threeDucks(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  ctidTraderAccountId: number,
  symbolId: number,
  volumeInLots: number,
  stopLossInPips: number,
  takeProfitInPips: number,
  smaPeriod: number = 60
): void {
  const toTimestamp = Date.now();
  const histH4 = historic(incomingProtoMessages, output, {
    ctidTraderAccountId,
    fromTimestamp:
      toTimestamp - 2 * smaPeriod * periodToMillis($.ProtoOATrendbarPeriod.H4),
    toTimestamp,
    symbolId,
    period: $.ProtoOATrendbarPeriod.H4
  });
  const histH1 = historic(incomingProtoMessages, output, {
    ctidTraderAccountId,
    fromTimestamp:
      toTimestamp - 2 * smaPeriod * periodToMillis($.ProtoOATrendbarPeriod.H1),
    toTimestamp,
    symbolId,
    period: $.ProtoOATrendbarPeriod.H1
  });
  const histM5 = historic(incomingProtoMessages, output, {
    ctidTraderAccountId,
    fromTimestamp:
      toTimestamp - 2 * smaPeriod * periodToMillis($.ProtoOATrendbarPeriod.M5),
    toTimestamp,
    symbolId,
    period: $.ProtoOATrendbarPeriod.M5
  });
  const historicSnapshots = combineLatest(
    histH4,
    histH1,
    histM5,
    (h4, h1, m5) => snapshotz(h4, h1, m5)
  ).pipe(flatMap(value => value));

  const request = of(pm2127({ symbolId: [symbolId], ctidTraderAccountId }));
  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    map(pm => pm.payload.bid),
    filter((data): data is number => typeof data === "number")
  );

  const latestH4 = histH4.pipe(
    flatMap(bars => bars),
    last()
  );
  const liveH4 = liveTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H4
  );
  const polledH4 = polledTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H4
  );
  const recentH4 = merge(latestH4, liveH4, polledH4).pipe(
    distinctUntilChanged((x, y) => x.timestamp === y.timestamp)
  );

  const latestH1 = histH1.pipe(
    flatMap(bars => bars),
    last()
  );
  const liveH1 = liveTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H1
  );
  const polledH1 = polledTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H1
  );
  const recentH1 = merge(latestH1, liveH1, polledH1).pipe(
    distinctUntilChanged((x, y) => x.timestamp === y.timestamp)
  );

  const latestM5 = histM5.pipe(
    flatMap(bars => bars),
    last()
  );
  const liveM5 = liveTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.M5
  );
  const polledM5 = polledTrendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.M5
  );
  const recentM5 = merge(latestM5, liveM5, polledM5).pipe(
    distinctUntilChanged((x, y) => x.timestamp === y.timestamp)
  );

  const recentSnapshots = request.pipe(
    tap(output),
    flatMap(() =>
      combineLatest(recentH4, recentH1, recentM5, (h4, h1, m5) => ({
        date: m5.date,
        timestamp: m5.timestamp,
        h4,
        h1,
        m5
      }))
    )
  );

  const threeDucks = signals(smaPeriod);
  const snapshots = concat(historicSnapshots, recentSnapshots).pipe(
    validSnapshot(),
    tap(snapshot => threeDucks.update(snapshot))
  );
  combineLatest(snapshots, live, (_snapshots, live) =>
    threeDucks.recommend(live)
  )
    .pipe(
      tradeStrategy(
        ctidTraderAccountId,
        symbolId,
        volumeInLots,
        stopLossInPips,
        takeProfitInPips
      )
    )
    .subscribe(output);
}
