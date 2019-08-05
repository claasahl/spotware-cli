import { Trendbar, Snapshot } from "../types";
import { periodToMillis } from "../utils";
import { from } from "rxjs";
import { scan, filter, distinctUntilChanged } from "rxjs/operators";
import { validSnapshot } from "../operators";

function lowerBoundary(h4: Trendbar[], h1: Trendbar[], m5: Trendbar[]): number {
  const timestampH4 = h4.length > 0 ? h4[0].timestamp : Number.MAX_VALUE;
  const timestampH1 = h1.length > 0 ? h1[0].timestamp : Number.MAX_VALUE;
  const timestampM5 = m5.length > 0 ? m5[0].timestamp : Number.MAX_VALUE;
  const boundary = Math.min(timestampH4, timestampH1, timestampM5);
  if (boundary === Number.MAX_VALUE) {
    throw new Error("no trendbars");
  }
  return boundary;
}

function upperBoundary(h4: Trendbar[], h1: Trendbar[], m5: Trendbar[]): number {
  const timestampH4 =
    h4.length > 0 ? h4[h4.length - 1].timestamp : Number.MIN_VALUE;
  const timestampH1 =
    h1.length > 0 ? h1[h1.length - 1].timestamp : Number.MIN_VALUE;
  const timestampM5 =
    m5.length > 0 ? m5[m5.length - 1].timestamp : Number.MIN_VALUE;
  const boundary = Math.max(timestampH4, timestampH1, timestampM5);
  if (boundary === Number.MIN_VALUE) {
    throw new Error("no trendbars");
  }
  return boundary;
}

function expected(time: number, trendbar: Trendbar): boolean {
  const millis = periodToMillis(trendbar.period);
  const begin = trendbar.timestamp + millis;
  const end = trendbar.timestamp + 2 * millis;
  return begin <= time && time < end;
}

function snapshot(
  time: number,
  h4: Trendbar[],
  h1: Trendbar[],
  m5: Trendbar[]
): Partial<Snapshot> {
  const snapshot: Partial<Snapshot> = {};
  if (h4.length > 0 && expected(time, h4[0])) {
    snapshot.h4 = h4.shift() as Trendbar;
  }
  if (h1.length > 0 && expected(time, h1[0])) {
    snapshot.h1 = h1.shift() as Trendbar;
  }
  if (m5.length > 0 && expected(time, m5[0])) {
    snapshot.m5 = m5.shift() as Trendbar;
  }
  return snapshot;
}

export function* generator(
  h4: Trendbar[],
  h1: Trendbar[],
  m5: Trendbar[]
): IterableIterator<Partial<Snapshot>> {
  const MIN = 60000;
  const lower = lowerBoundary(h4, h1, m5);
  const upper = upperBoundary(h4, h1, m5);
  let time = lower;
  while (time < upper) {
    yield snapshot(time, h4, h1, m5);
    time += MIN;
  }
}

export function snapshots(h4: Trendbar[], h1: Trendbar[], m5: Trendbar[]) {
  return from(generator(h4, h1, m5)).pipe(
    scan((acc, value) => ({ ...acc, ...value })),
    filter(
      (snapshot): snapshot is Pick<Snapshot, "h4" | "h1" | "m5"> =>
        !!snapshot.h4 && !!snapshot.h1 && !!snapshot.m5
    ),
    distinctUntilChanged(
      (x, y) =>
        x.h4.timestamp === y.h4.timestamp &&
        x.h1.timestamp === y.h1.timestamp &&
        x.m5.timestamp === y.m5.timestamp
    ),
    validSnapshot()
  );
}
