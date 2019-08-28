import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, throwError, race, EMPTY } from "rxjs";
import { first, flatMap, takeUntil, endWith } from "rxjs/operators";

import config from "./config";

const { host, port } = config;

const socket = $.connect(port, host);

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
protoMessages
  .pipe(takeUntil(endConditions))
  .subscribe(
    next => console.log("next", next),
    error => console.log("error", error),
    () => console.log("complete")
  );
