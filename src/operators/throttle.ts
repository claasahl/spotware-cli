import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, concat, pipe, of, timer, EMPTY } from "rxjs";
import { concatMap, flatMap } from "rxjs/operators";

export function throttle<T = $.ProtoMessages>(
  duration: number
): OperatorFunction<T, T> {
  return pipe(
    concatMap(pm => {
      const head = of(pm);
      const tail = timer(duration).pipe(flatMap(() => EMPTY));
      return concat(head, tail);
    })
  );
}
