import * as $ from "@claasahl/spotware-adapter";
import { AnonymousSubject, Subject } from "rxjs/internal/Subject";
import tls from "tls";
import {
  Observable,
  fromEvent,
  throwError,
  EMPTY,
  race,
  Observer,
  of,
  timer,
  concat
} from "rxjs";
import {
  first,
  flatMap,
  endWith,
  takeUntil,
  tap,
  share,
  take,
  concatMap
} from "rxjs/operators";
import debug, { Debugger } from "debug";

export class SpotwareSubject extends AnonymousSubject<$.ProtoMessages> {
  constructor(port: number, host: string, options?: tls.TlsOptions) {
    const log = debug(`${host}:${port}`);
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
      tap(error => log(JSON.stringify({ error }))),
      flatMap(error => throwError(error))
    );
    const end = fromEvent<never>(socket, "end").pipe(
      first(),
      tap(() => log(JSON.stringify({ ended: true }))),
      flatMap(() => EMPTY)
    );
    const close = fromEvent<never>(socket, "close").pipe(
      first(),
      tap(() => log(JSON.stringify({ closed: true }))),
      flatMap(() => EMPTY)
    );
    const endConditions = race(error, end, close).pipe(endWith("byebye"));
    return fromEvent<$.ProtoMessages>(socket, "PROTO_MESSAGE.INPUT.*").pipe(
      takeUntil(endConditions),
      tap(pm => log(JSON.stringify({ protoMessage: pm }))),
      share()
    );
  }

  private static dst(
    socket: tls.TLSSocket,
    log: Debugger
  ): Observer<$.ProtoMessages> {
    const s = new Subject<$.ProtoMessages>();
    s.pipe(
      concatMap(value =>
        concat(
          of(value),
          timer(300).pipe(
            take(1),
            flatMap(() => EMPTY)
          )
        )
      )
    ).subscribe(
      value => {
        $.write(socket, value);
        log(JSON.stringify({ protoMessage: value }));
      },
      error => {
        socket.end();
        log(JSON.stringify({ error }));
      },
      () => {
        socket.end();
        log(JSON.stringify({ closed: true }));
      }
    );
    return s;
  }
}
