import { Trendbar, Snapshot } from "../types";
import { periodToMillis } from "../utils";
import { OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

function follows(head: Trendbar, tail: Trendbar): boolean {
  const outerBegin = tail.timestamp + periodToMillis(tail.period);
  const innerBegin = head.timestamp;
  const innerEnd = head.timestamp + periodToMillis(head.period);
  const outerEnd = tail.timestamp + 2 * periodToMillis(tail.period);
  return (
    outerBegin <= innerBegin &&
    innerBegin <= outerEnd &&
    outerBegin <= innerEnd &&
    innerEnd <= outerEnd
  );
}

export function validSnapshot<T extends keyof Snapshot>(): OperatorFunction<
  Pick<Snapshot, T>,
  Pick<Snapshot, T>
> {
  return filter((snapshot: any) => {
    // FIXME
    const { m5, h1, h4 } = snapshot;
    return follows(m5, h1) && follows(h1, h4);
  });
}
