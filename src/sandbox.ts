import * as $ from "@claasahl/spotware-adapter";

import config from "./config";
import {
  Subject,
  fromEvent,
  of,
  timer,
  EMPTY,
  concat,
  pipe,
  OperatorFunction,
  interval,
  Observable
} from "rxjs";
import {
  map,
  tap,
  concatMap,
  flatMap,
  share,
  filter,
  first,
  timeoutWith
} from "rxjs/operators";
import util from "./util";

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

function throttle<T = $.ProtoMessages>(
  duration: number
): OperatorFunction<T, T> {
  return pipe(
    concatMap(pm => {
      const head = of(pm);
      const tail = timer(duration).pipe(flatMap(() => EMPTY));
      return concat(head, tail);
    })
  );
}
function when(
  payloadType: 5
): OperatorFunction<$.ProtoMessages, $.ProtoMessage5>;
function when(
  payloadType: 50
): OperatorFunction<$.ProtoMessages, $.ProtoMessage50>;
function when(
  payloadType: 51
): OperatorFunction<$.ProtoMessages, $.ProtoMessage51>;
function when(
  payloadType: 2100
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2100>;
function when(
  payloadType: 2101
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2101>;
function when(
  payloadType: 2102
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2102>;
function when(
  payloadType: 2103
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2103>;
function when(
  payloadType: 2104
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2104>;
function when(
  payloadType: 2105
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2105>;
function when(
  payloadType: 2106
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2106>;
function when(
  payloadType: 2107
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2107>;
function when(
  payloadType: 2108
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2108>;
function when(
  payloadType: 2109
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2109>;
function when(
  payloadType: 2110
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2110>;
function when(
  payloadType: 2111
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2111>;
function when(
  payloadType: 2112
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2112>;
function when(
  payloadType: 2113
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2113>;
function when(
  payloadType: 2114
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2114>;
function when(
  payloadType: 2115
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2115>;
function when(
  payloadType: 2116
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2116>;
function when(
  payloadType: 2117
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2117>;
function when(
  payloadType: 2118
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2118>;
function when(
  payloadType: 2119
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2119>;
function when(
  payloadType: 2120
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2120>;
function when(
  payloadType: 2121
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2121>;
function when(
  payloadType: 2122
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2122>;
function when(
  payloadType: 2123
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2123>;
function when(
  payloadType: 2124
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2124>;
function when(
  payloadType: 2125
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2125>;
function when(
  payloadType: 2126
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2126>;
function when(
  payloadType: 2127
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2127>;
function when(
  payloadType: 2128
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2128>;
function when(
  payloadType: 2129
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2129>;
function when(
  payloadType: 2130
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2130>;
function when(
  payloadType: 2131
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2131>;
function when(
  payloadType: 2132
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2132>;
function when(
  payloadType: 2133
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2133>;
function when(
  payloadType: 2134
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2134>;
function when(
  payloadType: 2135
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2135>;
function when(
  payloadType: 2136
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2136>;
function when(
  payloadType: 2137
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2137>;
function when(
  payloadType: 2138
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2138>;
function when(
  payloadType: 2139
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2139>;
function when(
  payloadType: 2140
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2140>;
function when(
  payloadType: 2141
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2141>;
function when(
  payloadType: 2142
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2142>;
function when(
  payloadType: 2143
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2143>;
function when(
  payloadType: 2144
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2144>;
function when(
  payloadType: 2145
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2145>;
function when(
  payloadType: 2146
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2146>;
function when(
  payloadType: 2147
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2147>;
function when(
  payloadType: 2148
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2148>;
function when(
  payloadType: 2149
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2149>;
function when(
  payloadType: 2150
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2150>;
function when(
  payloadType: 2151
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2151>;
function when(
  payloadType: 2152
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2152>;
function when(
  payloadType: 2153
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2153>;
function when(
  payloadType: 2154
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2154>;
function when(
  payloadType: 2155
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2155>;
function when(
  payloadType: 2156
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2156>;
function when(
  payloadType: 2157
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2157>;
function when(
  payloadType: 2158
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2158>;
function when(
  payloadType: 2159
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2159>;
function when(
  payloadType: 2160
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2160>;
function when(
  payloadType: 2161
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2161>;
function when(
  payloadType: 2162
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2162>;
function when(
  payloadType: 2163
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2163>;
function when(
  payloadType: 2164
): OperatorFunction<$.ProtoMessages, $.ProtoMessage2164>;
function when(
  payloadType: $.ProtoOAPayloadType | $.ProtoPayloadType
): OperatorFunction<$.ProtoMessages, $.ProtoMessages> {
  return filter(
    (pm: $.ProtoMessages): pm is $.ProtoMessages =>
      pm.payloadType === payloadType
  );
}

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

const BTCEUR = 22396;

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
incomingProtoMessages.pipe(requestAccounts()).subscribe(output);
incomingProtoMessages.pipe(authenticateAccounts()).subscribe(output);
incomingProtoMessages
  .pipe(requestLastTrendbars(10, $.ProtoOATrendbarPeriod.M1, BTCEUR))
  .subscribe(output);
