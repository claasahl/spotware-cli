import {
  connect,
  ProtoMessages,
  write,
  ProtoOAPayloadType,
  ProtoPayloadType,
  ProtoMessage2101,
  ProtoMessage2150,
  ProtoOACtidTraderAccount,
  ProtoMessage2149,
  ProtoMessage2102,
  ProtoMessage51,
  ProtoMessage2100
} from "@claasahl/spotware-adapter";

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
  ReplaySubject,
  Observable
} from "rxjs";
import {
  map,
  tap,
  concatMap,
  flatMap,
  share,
  filter,
  first
} from "rxjs/operators";
import util from "./util";

const { host, port, clientId, clientSecret, accessToken } = config;

const socket = connect(
  port,
  host
);

const incomingProtoMessages = fromEvent<ProtoMessages>(
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

const outgoingProtoMessages = new Subject<ProtoMessages>();
outgoingProtoMessages
  .pipe(
    throttle(1000),
    tap(pm => write(socket, pm))
  )
  .subscribe();

function throttle<T = ProtoMessages>(duration: number): OperatorFunction<T, T> {
  return pipe(
    concatMap(pm => {
      const head = of(pm);
      const tail = timer(duration).pipe(flatMap(() => EMPTY));
      return concat(head, tail);
    })
  );
}

function when<T extends ProtoMessages>(
  payloadType: ProtoOAPayloadType | ProtoPayloadType
): OperatorFunction<ProtoMessages, T> {
  return filter((pm: ProtoMessages): pm is T => pm.payloadType === payloadType);
}

function output(pm: ProtoMessages) {
  outgoingProtoMessages.next(pm);
}

function authenticateApplication(): Observable<ProtoMessage2100> {
  return of(util.applicationAuth({ clientId, clientSecret }));
}

function heartbeats(): Observable<ProtoMessage51> {
  return interval(10000).pipe(
    map(heartbeatNo => util.heartbeat({}, `HeartbeatNo${heartbeatNo}`))
  );
}

function requestAccounts(): OperatorFunction<ProtoMessages, ProtoMessage2149> {
  return pipe(
    when<ProtoMessage2101>(ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES),
    first(),
    flatMap(() => of(util.getAccountsByAccessToken({ accessToken })))
  );
}

function authenticateAccounts(): OperatorFunction<
  ProtoMessages,
  ProtoMessage2102
> {
  return pipe(
    when<ProtoMessage2150>(
      ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
    ),
    first(),
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      util.accountAuth({ ctidTraderAccountId, accessToken })
    )
  );
}

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
incomingProtoMessages.pipe(requestAccounts()).subscribe(output);
incomingProtoMessages.pipe(authenticateAccounts()).subscribe(output);
