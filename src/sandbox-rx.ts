import * as $ from "@claasahl/spotware-adapter";
import { Subject, fromEvent, throwError, race, EMPTY } from "rxjs";
import { map, tap, share, first, flatMap } from "rxjs/operators";

import config from "./config";
import { throttle } from "./operators";

const { host, port } = config;

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

export function output(pm: $.ProtoMessages) {
  outgoingProtoMessages.next(pm);
}

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
race(error, end, close).subscribe(
  next => console.log("next", next),
  error => console.log("error", error),
  () => console.log("complete")
);
