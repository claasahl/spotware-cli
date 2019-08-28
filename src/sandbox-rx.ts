import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, throwError, race, EMPTY, using, timer } from "rxjs";
import { first, flatMap, takeUntil, endWith } from "rxjs/operators";

import config from "./config";

const protoMessages = using(
  () => {
    const { host, port } = config;
    const socket = $.connect(port, host);
    return { socket, unsubscribe: () => socket.end() };
  },
  resource => {
    const { socket } = resource as any;
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
    const protoMessages = fromEvent<$.ProtoMessages>(socket, "PROTO_MESSAGE.*");
    return protoMessages.pipe(takeUntil(endConditions));
  }
);

protoMessages
  .pipe(takeUntil(timer(1000)))
  .subscribe(
    next => console.log("next", next),
    error => console.log("error", error),
    () => console.log("complete")
  );
