import * as $ from "@claasahl/spotware-adapter";
import { AnonymousSubject } from "rxjs/internal/Subject";
import tls from "tls";
import { Observable, fromEvent, throwError, EMPTY, race, Observer } from "rxjs";
import { first, flatMap, endWith, takeUntil, tap, share } from "rxjs/operators";
import debug, { Debugger } from "debug";

export class SpotwareSubject extends AnonymousSubject<$.ProtoMessages> {
  constructor(port: number, host: string, options?: tls.TlsOptions) {
    const log = debug(`${host}:${port}`);
    // log.log = console.log.bind(console);

    const socket = $.connect(port, host, options);
    const destination = SpotwareSubject.dst(socket, log.extend("output"));
    const source = SpotwareSubject.src(socket, log.extend("input"));
    super(destination, source);
  }

  private static src(
    socket: tls.TLSSocket,
    log: Debugger
  ): Observable<$.ProtoMessages> {
    const error = fromEvent<never>(socket, "error").pipe(
      first(),
      flatMap(error => throwError(error)),
      tap(error => log(JSON.stringify({ error })))
    );
    const end = fromEvent<never>(socket, "end").pipe(
      first(),
      flatMap(() => EMPTY),
      tap(() => log(JSON.stringify({ ended: true })))
    );
    const close = fromEvent<never>(socket, "close").pipe(
      first(),
      flatMap(() => EMPTY),
      tap(() => log(JSON.stringify({ closed: true })))
    );
    const endConditions = race(error, end, close).pipe(endWith("byebye"));
    return fromEvent<$.ProtoMessages>(socket, "PROTO_MESSAGE.*").pipe(
      takeUntil(endConditions),
      tap(pm => log(JSON.stringify({ protoMessage: pm }))),
      share()
    );
  }

  private static dst(
    socket: tls.TLSSocket,
    log: Debugger
  ): Observer<$.ProtoMessages> {
    return {
      next: value => {
        $.write(socket, value);
        log(JSON.stringify({ protoMessage: value }));
      },
      error: error => {
        socket.end();
        log(JSON.stringify({ error }));
      },
      complete: () => {
        socket.end();
        log(JSON.stringify({ closed: true }));
      }
    };
  }
}
