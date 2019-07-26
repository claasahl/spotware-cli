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
  observeOn
} from "rxjs/operators";
import {
  connect,
  ProtoMessages,
  write,
  ProtoOAPayloadType
} from "@claasahl/spotware-adapter";

import CONFIG from "./config";
import UTIL from "./util";

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
  inputProtoMessages
    .pipe(
      filter2101(),
      first(),
      map(() => UTIL.pm2149({ accessToken }))
    )
    .subscribe(message => outputProtoMessages.next(message));
}

function authenticateAccounts() {
  const accounts = inputProtoMessages.pipe(
    filter2150(),
    first(),
    flatMap(message => of(...message.payload.ctidTraderAccount))
  );

  accounts
    .pipe(
      map(({ ctidTraderAccountId }) =>
        UTIL.pm2102({ accessToken, ctidTraderAccountId })
      )
    )
    .subscribe(message => outputProtoMessages.next(message));
}

function authenticateApplication() {
  return of(UTIL.pm2100({ clientId, clientSecret }));
}

function heartbeats(period: number = 10000) {
  return interval(period).pipe(map(() => UTIL.pm51({})));
}

function filter2101() {
  return pipe(
    flatMap((value: ProtoMessages) => {
      if (value.payloadType === 2101) {
        return of(value);
      }
      return EMPTY;
    })
    // filter(value => value.payloadType === 2146),
  );
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

requestAccounts();
authenticateAccounts();
authenticateApplication().subscribe(pm => outputProtoMessages.next(pm));
heartbeats().subscribe(pm => outputProtoMessages.next(pm));
