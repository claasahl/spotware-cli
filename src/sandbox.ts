import * as $ from "@claasahl/spotware-adapter";
import { Subject, fromEvent } from "rxjs";
import { map, tap, share } from "rxjs/operators";

import config from "./config";
import { when, throttle } from "./operators";
import {
  authenticateApplication,
  heartbeats,
  requestAccounts,
  authenticateAccounts
} from "./routines";
import { trendbars } from "./magic";

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

trendbars(
  incomingProtoMessages,
  output,
  BTCEUR,
  $.ProtoOATrendbarPeriod.M1,
  10
).subscribe(value => {
  const date = new Date();
  console.log(date, JSON.stringify(value));
});
