import * as $ from "@claasahl/spotware-adapter";
import { Subject, fromEvent, from } from "rxjs";
import { map, tap, share, flatMap } from "rxjs/operators";

import config from "./config";
import { when, throttle } from "./operators";
import {
  authenticateApplication,
  heartbeats,
  requestAccounts,
  authenticateAccounts
} from "./routines";
import { threeDucks } from "./magic";

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
    throttle(300),
    tap(pm => $.write(socket, pm))
  )
  .subscribe();

function output(pm: $.ProtoMessages) {
  outgoingProtoMessages.next(pm);
}

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

// PROTO_OA_ACCOUNT_AUTH_RES ->
const ACCOUNT_AUTH_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES)
);
ACCOUNT_AUTH_RES.pipe(
  map(pm => pm.payload.ctidTraderAccountId),
  flatMap(ctidTraderAccountId =>
    from(config.threeDucks).pipe(
      map(value => ({ ...value, ctidTraderAccountId }))
    )
  ),
  tap(
    ({
      ctidTraderAccountId,
      symbolId,
      volumeInLots,
      stopLossInPips,
      takeProfitInPips,
      smaPeriod
    }) => {
      threeDucks(
        incomingProtoMessages,
        output,
        ctidTraderAccountId,
        symbolId,
        volumeInLots,
        stopLossInPips,
        takeProfitInPips,
        smaPeriod
      );
    }
  )
).subscribe();
