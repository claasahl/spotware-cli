import * as $ from "@claasahl/spotware-adapter";
import { interval, OperatorFunction, pipe } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { pm51 } from "../utils";

export function heartbeats(
  period: number = 10000
): OperatorFunction<$.ProtoMessage2101, $.ProtoMessage51> {
  const beats = interval(period).pipe(
    map(heartbeatNo => pm51({}, `HeartbeatNo${heartbeatNo}`))
  );
  return pipe(switchMap(() => beats));
}
