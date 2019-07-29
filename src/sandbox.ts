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
  concat
} from "rxjs";
import {
  map,
  tap,
  flatMap,
  share,
  first,
  timeoutWith,
  filter
} from "rxjs/operators";

import config from "./config";
import util from "./util";
import { when, throttle } from "./operators";

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

function heartbeats(): Observable<$.ProtoMessage51> {
  return interval(10000).pipe(
    map(heartbeatNo => util.heartbeat({}, `HeartbeatNo${heartbeatNo}`))
  );
}

function requestAccounts(): OperatorFunction<
  $.ProtoMessages,
  $.ProtoMessage2149
> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES),
    first(),
    flatMap(() => of(util.getAccountsByAccessToken({ accessToken })))
  );
}

function authenticateAccounts(): OperatorFunction<
  $.ProtoMessages,
  $.ProtoMessage2102
> {
  return pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    first(),
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      util.accountAuth({ ctidTraderAccountId, accessToken })
    )
  );
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
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2127 | $.ProtoMessage2135> {
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

const BTCEUR = 22396;

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
incomingProtoMessages.pipe(requestAccounts()).subscribe(output);
incomingProtoMessages.pipe(authenticateAccounts()).subscribe(output);
incomingProtoMessages
  .pipe(requestLastTrendbars(10, $.ProtoOATrendbarPeriod.M1, BTCEUR))
  .subscribe(output);
incomingProtoMessages
  .pipe(requestLiveTrendbars($.ProtoOATrendbarPeriod.M1, BTCEUR))
  .subscribe(output);

interface Trendbar {
  volume: number;
  period: $.ProtoOATrendbarPeriod;
  low: number;
  open: number;
  close: number;
  high: number;
  timestamp: number;
  date: Date;
}
function trendbar(): OperatorFunction<$.ProtoOATrendbar, Trendbar> {
  return map(
    ({
      volume,
      low = 0,
      period = $.ProtoOATrendbarPeriod.MN1,
      deltaClose = 0,
      deltaHigh = 0,
      deltaOpen = 0,
      utcTimestampInMinutes = 0
    }) => ({
      volume,
      period,
      low,
      open: low + deltaOpen,
      close: low + deltaClose,
      high: low + deltaHigh,
      timestamp: utcTimestampInMinutes * 60000,
      date: new Date(utcTimestampInMinutes * 60000)
    })
  );
}
incomingProtoMessages
  .pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
    filter(pm => pm.payload.symbolId === BTCEUR),
    flatMap(pm => pm.payload.trendbar),
    trendbar()
  )
  .subscribe(value => {
    const date = new Date();
    console.log(date, JSON.stringify(value));
  });
incomingProtoMessages
  .pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === BTCEUR),
    flatMap(pm => pm.payload.trendbar),
    trendbar()
  )
  .subscribe(value => {
    const date = new Date();
    console.log(date, JSON.stringify(value));
  });
