import * as $ from "@claasahl/spotware-adapter";
import { Subject, fromEvent, combineLatest } from "rxjs";
import {
  map,
  tap,
  share,
  filter,
  debounceTime,
  distinctUntilChanged,
  groupBy,
  mergeMap
} from "rxjs/operators";

import config from "./config";
import { when, throttle, SimpleMovingAverage } from "./operators";
import {
  authenticateApplication,
  heartbeats,
  requestAccounts,
  authenticateAccounts
} from "./routines";
import { trendbars } from "./magic";
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

function output(pm: $.ProtoMessages) {
  outgoingProtoMessages.next(pm);
}

export const BTCEUR = 22396;
export const EURSEK = 47;

// 💥 -> PROTO_OA_APPLICATION_AUTH_REQ
authenticateApplication({ clientId, clientSecret }).subscribe(output);

// PROTO_OA_APPLICATION_AUTH_RES -> HEARTBEAT_EVENT
// PROTO_OA_APPLICATION_AUTH_RES -> PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ
const APPLICATION_AUTH_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES)
);
APPLICATION_AUTH_RES.pipe(heartbeats()).subscribe(output);
APPLICATION_AUTH_RES.pipe(requestAccounts({ accessToken })).subscribe(output);

// PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES -> PROTO_OA_ACCOUNT_AUTH_REQ
const GET_ACCOUNTS_BY_ACCESS_TOKEN_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES)
);
GET_ACCOUNTS_BY_ACCESS_TOKEN_RES.pipe(
  authenticateAccounts({ accessToken })
).subscribe(output);

const M1 = trendbars(
  incomingProtoMessages,
  output,
  BTCEUR,
  $.ProtoOATrendbarPeriod.M1,
  100
).pipe(share());
const M15 = trendbars(
  incomingProtoMessages,
  output,
  BTCEUR,
  $.ProtoOATrendbarPeriod.M15,
  100
).pipe(share());
const H1 = trendbars(
  incomingProtoMessages,
  output,
  BTCEUR,
  $.ProtoOATrendbarPeriod.H1,
  100
).pipe(share());

M1.subscribe(value => {
  const date = new Date();
  console.log(date, "M1", JSON.stringify(value));
});
M15.subscribe(value => {
  const date = new Date();
  console.log(date, "M15", JSON.stringify(value));
});
H1.subscribe(value => {
  const date = new Date();
  console.log(date, "H1", JSON.stringify(value));
});

const symbolId = BTCEUR;
const live = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
  filter(pm => pm.payload.symbolId === symbolId),
  map(pm => [pm.payload.bid, pm.payload.ctidTraderAccountId]),
  filter((data): data is number[] => typeof data[0] === "number")
);
const smaM1 = M1.pipe(SimpleMovingAverage(60));
const smaM15 = M15.pipe(SimpleMovingAverage(60));
const smaH1 = H1.pipe(SimpleMovingAverage(60));
combineLatest(
  smaH1,
  smaM15,
  smaM1,
  live,
  (h1, m15, m1, [live, ctidTraderAccountId]) => {
    console.log(
      h1.close < live,
      m15.close < live,
      m1.close < live,
      m1.high < live,
      "||",
      h1.close > live,
      m15.close > live,
      m1.close > live,
      m1.low > live
    );
    if (h1.close < live && m15.close < live && m1.close < live) {
      return [m1.high < live ? "STRONGER BUY" : "BUY", ctidTraderAccountId];
    }
    if (h1.close > live && m15.close > live && m1.close > live) {
      return [m1.low > live ? "STRONGER SELL" : "SELL", ctidTraderAccountId];
    }
    return undefined;
  }
)
  .pipe(
    filter(
      (result): result is [string, number] => typeof result !== "undefined"
    ),
    groupBy(([_result, ctidTraderAccountId]) => ctidTraderAccountId),
    mergeMap(t =>
      t.pipe(
        map(([result, _]) => result),
        debounceTime(500),
        distinctUntilChanged((x, y) => x === y),
        tap(result => {
          const date = new Date();
          console.log(date, "DUCKS", JSON.stringify(result));
        }),
        map(result => {
          const MULTIPLIER = 10000;
          const order: $.ProtoOANewOrderReq = {
            ctidTraderAccountId: t.key,
            symbolId,
            orderType: $.ProtoOAOrderType.MARKET,
            tradeSide: $.ProtoOATradeSide.BUY,
            volume: 10,
            relativeStopLoss: 300 * MULTIPLIER,
            relativeTakeProfit: 600 * MULTIPLIER,
            trailingStopLoss: true
          };
          switch (result) {
            case "BUY":
              return util.newOrder({
                ...order,
                tradeSide: $.ProtoOATradeSide.BUY
              });
            case "STRONGER BUY":
              return util.newOrder({
                ...order,
                tradeSide: $.ProtoOATradeSide.BUY,
                volume: 20
              });
            case "SELL":
              return util.newOrder({
                ...order,
                tradeSide: $.ProtoOATradeSide.SELL
              });
            case "STRONGER SELL":
              return util.newOrder({
                ...order,
                tradeSide: $.ProtoOATradeSide.SELL,
                volume: 20
              });
            default:
              throw new Error(`unknown result: ${result}`);
          }
        }),
        tap(result => {
          const date = new Date();
          console.log(date, "DUCKS", JSON.stringify(result));
        })
      )
    )
  )
  .subscribe(output);
