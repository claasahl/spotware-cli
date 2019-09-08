import * as $ from "@claasahl/spotware-adapter";
import {
  fromEvent,
  throwError,
  race,
  EMPTY,
  Observable,
  Observer,
  timer,
  of,
  concat
} from "rxjs";
import {
  first,
  flatMap,
  takeUntil,
  endWith,
  filter,
  take,
  tap,
  map
} from "rxjs/operators";

import config from "./config";
import { AnonymousSubject } from "rxjs/internal/Subject";
import tls from "tls";
import { pm2100, pm2149 } from "./utils";

// https://youtu.be/8CNVYWiR5fg?t=378

export class SpotwareSubject extends AnonymousSubject<$.ProtoMessages> {
  constructor(port: number, host: string, options?: tls.TlsOptions) {
    const socket = $.connect(port, host, options);
    const destination = SpotwareSubject.dst(socket);
    const source = SpotwareSubject.src(socket);
    super(destination, source);
  }

  private static src(socket: tls.TLSSocket): Observable<$.ProtoMessages> {
    const error = fromEvent<never>(socket, "error").pipe(
      first(),
      flatMap(error => throwError(error))
    );
    const end = fromEvent<never>(socket, "end").pipe(
      first(),
      flatMap(() => EMPTY)
    );
    const close = fromEvent<never>(socket, "close").pipe(
      first(),
      flatMap(() => EMPTY)
    );
    const endConditions = race(error, end, close).pipe(endWith("byebye"));
    return fromEvent<$.ProtoMessages>(socket, "PROTO_MESSAGE.*").pipe(
      takeUntil(endConditions)
    );
  }

  private static dst(socket: tls.TLSSocket): Observer<$.ProtoMessages> {
    return {
      next: value => {
        $.write(socket, value);
        console.log(`Wrote protoMessage to socket: ${JSON.stringify(value)}`);
      },
      error: err => {
        socket.end();
        console.log(`Closed socket due to error: ${err}`);
      },
      complete: () => {
        socket.end();
        console.log("Closed socket.");
      }
    };
  }
}

function error(msgId: string, timeout: number) {
  const error = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage50 =>
        pm.payloadType === $.ProtoPayloadType.ERROR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const protoOaError = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2142 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const protoOaOrderError = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2132 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_ORDER_ERROR_EVENT &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const noResponse = timer(timeout).pipe(
    take(1),
    flatMap(() => throwError(new Error("no timely response")))
  );
  return race(error, protoOaError, protoOaOrderError, noResponse);
}

function authenticateApplication(
  subject: SpotwareSubject,
  clientId: string,
  clientSecret: string,
  timeout: number = 2000
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2100({ clientId, clientSecret }, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2101 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(msgId, timeout));
  return concat(request, result);
}

function requestAccounts(
  subject: SpotwareSubject,
  accessToken: string,
  timeout: number = 2000
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2149({ accessToken }, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2150 =>
        pm.payloadType ===
          $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(msgId, timeout));
  return concat(request, result);
}

const subject = new SpotwareSubject(config.port, config.host);
subject
  .pipe(
    map(pm => {
      const date = new Date();
      return { timestamp: date.getTime(), date, msg: pm };
    })
  )
  .subscribe(
    next => console.log(JSON.stringify(next)),
    error => console.log("error", error),
    () => console.log("complete")
  );
const auth = authenticateApplication(
  subject,
  config.clientId,
  config.clientSecret,
  2000
);
const accounts = requestAccounts(subject, config.accessToken, 2000);

concat(auth, accounts).subscribe(
  next => console.log("_next", next),
  error => console.log("_error", error),
  () => console.log("_complete")
);
