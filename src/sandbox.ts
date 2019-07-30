import * as $ from "@claasahl/spotware-adapter";
import {
  Subject,
  fromEvent,
  of,
  EMPTY,
  pipe,
  OperatorFunction,
  interval,
  Observable,
  merge
} from "rxjs";
import {
  map,
  tap,
  flatMap,
  share,
  timeoutWith,
  filter,
  mergeMap,
  pairwise,
  distinctUntilChanged
} from "rxjs/operators";

import config from "./config";
import util from "./util";
import { when, throttle, trendbar, after } from "./operators";

const { host, port, clientId, clientSecret, accessToken } = config;

const socket = $.connect(port, host);

const incomingProtoMessages = fromEvent<$.ProtoMessages>(
  socket,
  "PROTO_MESSAGE.*"
).pipe(share());
incomingProtoMessages
  .pipe(
    map(pm => {
      const date = new Date();
      return { timestamp: date.getTime(), date, msg: pm };
    }),
    tap(msg => console.log(JSON.stringify(msg)))
  )
  .subscribe();

const outgoingProtoMessages = new Subject<$.ProtoMessages>();
outgoingProtoMessages
  .pipe(
    throttle(1000),
    tap(pm => $.write(socket, pm))
  )
  .subscribe();

function output(pm: $.ProtoMessages) {
  outgoingProtoMessages.next(pm);
}

function authenticateApplication(): Observable<$.ProtoMessage2100> {
  return of(util.applicationAuth({ clientId, clientSecret }));
}

function heartbeats(period: number = 10000): Observable<$.ProtoMessage51> {
  return interval(period).pipe(
    map(heartbeatNo => util.heartbeat({}, `HeartbeatNo${heartbeatNo}`))
  );
}

function requestAccounts(
  payload: $.ProtoOAGetAccountListByAccessTokenReq
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2149> {
  return pipe(
    after($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES),
    flatMap(() => of(util.getAccountsByAccessToken(payload)))
  );
}

function authenticateAccounts(
  payload: Omit<$.ProtoOAAccountAuthReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2102> {
  return pipe(
    after($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      util.accountAuth({ ...payload, ctidTraderAccountId })
    )
  );
}

function subscribeSpots(
  payload: Omit<$.ProtoOASubscribeSpotsReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2127> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.subscribeSpots({ ...payload, ctidTraderAccountId })
    )
  );
}

function subscribeTrendbars(
  payload: Omit<$.ProtoOASubscribeLiveTrendbarReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2135> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES),
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.subscribeTrendbars({ ...payload, ctidTraderAccountId })
    )
  );
}

function requestTrendbars(
  payload: Omit<$.ProtoOAGetTrendbarsReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
    timeoutWith(5000, EMPTY),
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.getTrendbars({ ...payload, ctidTraderAccountId })
    )
  );
}

function requestLastTrendbars(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  > & { trendbars: number }
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137> {
  const toTimestamp = new Date().getTime();
  const fromTimestamp =
    toTimestamp - util.periodToMillis(payload.period) * payload.trendbars;
  return requestTrendbars({ ...payload, fromTimestamp, toTimestamp });
}

function pollLatestTrendbar(
  payload: Omit<
    $.ProtoOAGetTrendbarsReq,
    "ctidTraderAccountId" | "fromTimestamp" | "toTimestamp"
  >
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
    map(pm => pm.payload.ctidTraderAccountId),
    mergeMap(ctidTraderAccountId =>
      interval(10000).pipe(
        map(() => {
          const date = new Date();
          date.setMilliseconds(0);
          date.setSeconds(0);
          const toTimestamp = date.getTime();
          const fromTimestamp = toTimestamp - util.periodToMillis(period);
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

export const BTCEUR = 22396;
export const EURSEK = 47;

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
incomingProtoMessages.pipe(requestAccounts({ accessToken })).subscribe(output);
incomingProtoMessages
  .pipe(authenticateAccounts({ accessToken }))
  .subscribe(output);

const symbolId = BTCEUR;
const period = $.ProtoOATrendbarPeriod.M1;
const trendbars = 10;
incomingProtoMessages
  .pipe(subscribeSpots({ symbolId: [symbolId] }))
  .subscribe(output);
incomingProtoMessages
  .pipe(subscribeTrendbars({ symbolId, period }))
  .subscribe(output);
incomingProtoMessages
  .pipe(requestLastTrendbars({ period, symbolId, trendbars }))
  .subscribe(output);
incomingProtoMessages
  .pipe(pollLatestTrendbar({ period, symbolId }))
  .subscribe(output);

const historic = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
  filter(pm => pm.payload.symbolId === symbolId),
  flatMap(pm => pm.payload.trendbar),
  trendbar()
);
const live = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
  filter(pm => pm.payload.symbolId === symbolId),
  flatMap(pm => pm.payload.trendbar),
  trendbar()
);
const latestClosedTrendbar = live.pipe(
  pairwise(),
  filter(([a, b]) => a.timestamp !== b.timestamp),
  flatMap(([a, _b]) => of(a))
);
merge(historic, latestClosedTrendbar)
  .pipe(distinctUntilChanged((x, y) => x.timestamp === y.timestamp))
  .subscribe(value => {
    const date = new Date();
    console.log(date, JSON.stringify(value));
  });

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
