import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, throwError, race, EMPTY, Observable, Observer } from "rxjs";
import { first, flatMap, takeUntil, endWith } from "rxjs/operators";

import config from "./config";
import { AnonymousSubject } from "rxjs/internal/Subject";
import tls from "tls";

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

const subject = new SpotwareSubject(config.port, config.host);
subject.subscribe(
  next => console.log("next", next),
  error => console.log("error", error),
  () => console.log("complete")
);
