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
  concat,
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
  accessToken: string
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2149> {
  return pipe(
    after($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES),
    flatMap(() => of(util.getAccountsByAccessToken({ accessToken })))
  );
}

function authenticateAccounts(): OperatorFunction<
  $.ProtoMessages,
  $.ProtoMessage2102
> {
  return pipe(
    after($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      util.accountAuth({ ctidTraderAccountId, accessToken })
    )
  );
}

export const BTCEUR = 22396;
export const EURSEK = 47;

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
incomingProtoMessages.pipe(requestAccounts(accessToken)).subscribe(output);
incomingProtoMessages.pipe(authenticateAccounts()).subscribe(output);
trendbars(incomingProtoMessages, 10, $.ProtoOATrendbarPeriod.M2, EURSEK);

function trendbars(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  trendbars: number,
  period: $.ProtoOATrendbarPeriod,
  symbolId: number
): void {
  function periodToMillis(period: $.ProtoOATrendbarPeriod): number {
    const MIN = 60000;
    switch (period) {
      case $.ProtoOATrendbarPeriod.M1:
        return MIN;
      case $.ProtoOATrendbarPeriod.M2:
        return 2 * MIN;
      case $.ProtoOATrendbarPeriod.M3:
        return 3 * MIN;
      case $.ProtoOATrendbarPeriod.M4:
        return 4 * MIN;
      case $.ProtoOATrendbarPeriod.M5:
        return 5 * MIN;
      case $.ProtoOATrendbarPeriod.M10:
        return 10 * MIN;
      case $.ProtoOATrendbarPeriod.M15:
        return 15 * MIN;
      case $.ProtoOATrendbarPeriod.M30:
        return 30 * MIN;
      case $.ProtoOATrendbarPeriod.H1:
        return 60 * MIN;
      case $.ProtoOATrendbarPeriod.H4:
        return 240 * MIN;
      case $.ProtoOATrendbarPeriod.H12:
        return 720 * MIN;
      case $.ProtoOATrendbarPeriod.D1:
        return 1440 * MIN;
      case $.ProtoOATrendbarPeriod.W1:
        return 10080 * MIN;
      //case $.ProtoOATrendbarPeriod.MN1:
      default:
        return 1;
    }
  }

  function requestTrendbars(
    from: Date | string | number,
    to: Date | string | number,
    period: $.ProtoOATrendbarPeriod,
    symbolId: number
  ): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137> {
    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();
    return pipe(
      when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
      timeoutWith(5000, EMPTY),
      map(pm => pm.payload.ctidTraderAccountId),
      map(ctidTraderAccountId =>
        util.getTrendbars({
          ctidTraderAccountId,
          fromTimestamp,
          toTimestamp,
          period,
          symbolId
        })
      )
    );
  }

  function requestLastTrendbars(
    trendbars: number,
    period: $.ProtoOATrendbarPeriod,
    symbolId: number
  ): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137> {
    const to = new Date().getTime();
    return requestTrendbars(
      to - periodToMillis(period) * trendbars,
      to,
      period,
      symbolId
    );
  }

  function requestLiveTrendbars(
    period: $.ProtoOATrendbarPeriod,
    symbolId: number
  ): OperatorFunction<
    $.ProtoMessages,
    $.ProtoMessage2127 | $.ProtoMessage2135
  > {
    return pipe(
      when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
      map(pm => pm.payload.ctidTraderAccountId),
      flatMap(ctidTraderAccountId => {
        const spots = util.subscribeSpots({
          ctidTraderAccountId,
          symbolId: [symbolId]
        });
        const trendbars = util.subscribeTrendbars({
          ctidTraderAccountId,
          period,
          symbolId
        });
        return concat(of(spots), of(trendbars));
      })
    );
  }

  const requestHistoric = incomingProtoMessages.pipe(
    requestLastTrendbars(trendbars, period, symbolId)
  );
  const requestLive = incomingProtoMessages.pipe(
    requestLiveTrendbars(period, symbolId)
  );
  const pollLatest = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
    map(pm => pm.payload.ctidTraderAccountId),
    mergeMap(ctidTraderAccountId =>
      interval(10000).pipe(
        map(() => {
          const date = new Date();
          date.setMilliseconds(0);
          date.setSeconds(0);
          const toTimestamp = date.getTime();
          const fromTimestamp = toTimestamp - periodToMillis(period);
          return util.getTrendbars({
            ctidTraderAccountId,
            fromTimestamp,
            toTimestamp,
            period,
            symbolId
          });
        })
      )
    )
  );
  merge(requestHistoric, requestLive, pollLatest).subscribe(output);

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
}
