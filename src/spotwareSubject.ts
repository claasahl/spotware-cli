import * as $ from "@claasahl/spotware-adapter";
import { AnonymousSubject } from "rxjs/internal/Subject";
import tls from "tls";
import { Observable, fromEvent, throwError, EMPTY, race, Observer } from "rxjs";
import { first, flatMap, endWith, takeUntil } from "rxjs/operators";

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
