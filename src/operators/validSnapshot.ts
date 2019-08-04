import { Trendbar, Snapshot } from "../types";
import { periodToMillis } from "../utils";
import { OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

function engulfed(inner: Trendbar, outer: Trendbar): boolean {
  const outerBegin = outer.timestamp;
  const innerBegin = inner.timestamp;
  const innerEnd = inner.timestamp + periodToMillis(inner.period);
  const outerEnd = outer.timestamp + periodToMillis(outer.period);
  return (
    outerBegin <= innerBegin &&
    innerBegin <= outerEnd &&
    outerBegin <= innerEnd &&
    innerEnd <= outerEnd
  );
}

export function validSnapshot(): OperatorFunction<Snapshot, Snapshot> {
  return filter(snapshot => {
    // FIXME
    const { m5, h1, h4 } = snapshot;
    return engulfed(m5, h1) && engulfed(h1, h4);
  });
}
