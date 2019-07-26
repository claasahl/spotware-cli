import {
  fromEvent,
  Subject,
  pipe,
  of,
  EMPTY,
  interval,
  asyncScheduler,
  Observer
} from "rxjs";
import {
  tap,
  share,
  first,
  flatMap,
  map,
  publishReplay,
  observeOn,
  filter
} from "rxjs/operators";
import {
  connect,
  ProtoMessages,
  write,
  ProtoOAPayloadType,
  ProtoPayloadType
} from "@claasahl/spotware-adapter";

import CONFIG from "./config";
import UTIL from "./util";

const {
  PROTO_OA_APPLICATION_AUTH_RES,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
} = ProtoOAPayloadType;

const { host, port, clientId, clientSecret, accessToken } = CONFIG;

const socket = connect(
  port,
  host
);
const inputProtoMessages = fromEvent<ProtoMessages>(
  socket,
  "PROTO_MESSAGE.*"
).pipe(share());
inputProtoMessages
  .pipe(
    tap(message => {
      const date = new Date();
      console.log(
        JSON.stringify({ timestamp: date.getTime(), date, msg: message })
      );
    })
  )
  .subscribe(
    undefined,
    error => console.log("input", error),
    () => console.log("input", "completed")
  );

const outputProtoMessages = new Subject<ProtoMessages>();
outputProtoMessages
  .pipe(tap(message => write(socket, message)))
  .subscribe(
    undefined,
    error => console.log("input", error),
    () => console.log("input", "completed")
  );

function requestAccounts() {
  // request accounts after application was authenticated
  return pipe(
    pmFilter(PROTO_OA_APPLICATION_AUTH_RES),
    first(),
    map(() => UTIL.getAccountsByAccessToken({ accessToken }))
  );
}

function authenticateAccounts() {
  // authenticate accounts once they become available
  return pipe(
    pmFilter(PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    filter2150(), // TODO find another way to "cast" values/events
    first(),
    flatMap(message => of(...message.payload.ctidTraderAccount)),
    map(({ ctidTraderAccountId }) =>
      UTIL.pm2102({ accessToken, ctidTraderAccountId })
    )
  );
}

function authenticateApplication() {
  return of(UTIL.pm2100({ clientId, clientSecret }));
}

function heartbeats(period: number = 10000) {
  return interval(period).pipe(map(() => UTIL.pm51({})));
}

function filter2150() {
  return pipe(
    flatMap((value: ProtoMessages) => {
      if (value.payloadType === 2150) {
        return of(value);
      }
      return EMPTY;
    })
    // filter(value => value.payloadType === 2146),
  );
}

function pmFilter(payloadType: ProtoOAPayloadType | ProtoPayloadType) {
  return filter<ProtoMessages>(pm => pm.payloadType === payloadType);
}

function output(pm: ProtoMessages) {
  outputProtoMessages.next(pm);
}

inputProtoMessages.pipe(requestAccounts()).subscribe(output);
inputProtoMessages.pipe(authenticateAccounts()).subscribe(output);

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
