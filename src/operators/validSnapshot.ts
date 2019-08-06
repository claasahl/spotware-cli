import { Trendbar, Snapshot } from "../types";
import { periodToMillis } from "../utils";
import { OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

function isAligned(time: number, trendbar: Trendbar) {
  const end = trendbar.timestamp + periodToMillis(trendbar.period);
  return time === end;
}

export function isValid(snapshot: Snapshot): boolean {
  const {
    d1,
    h12,
    h4,
    h1,
    m30,
    m20,
    m15,
    m10,
    m5,
    m4,
    m3,
    m2,
    m1,
    timestamp: time
  } = snapshot;
  const unalignedBars = [
    m1,
    m2,
    m3,
    m4,
    m5,
    m10,
    m15,
    m20,
    m30,
    h1,
    h4,
    h12,
    d1
  ]
    .filter((bar): bar is Trendbar => !!bar)
    .filter(bar => !isAligned(time, bar));
  return unalignedBars.length === 0;
}

export function validSnapshot(): OperatorFunction<Snapshot, Snapshot> {
  return filter(isValid);
}
