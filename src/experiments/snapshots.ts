import { Trendbar } from "../types";
import { periodToMillis } from "../utils";

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
): Trendbar[] {
  const trendbars: Trendbar[] = [];
  if (expected(time, h4[0])) {
    const trendbar = h4.shift() as Trendbar;
    trendbars.push(trendbar);
  }
  if (expected(time, h1[0])) {
    const trendbar = h1.shift() as Trendbar;
    trendbars.push(trendbar);
  }
  if (expected(time, m5[0])) {
    const trendbar = m5.shift() as Trendbar;
    trendbars.push(trendbar);
  }
  return trendbars;
}

export function* snapshots(
  h4: Trendbar[],
  h1: Trendbar[],
  m5: Trendbar[]
): IterableIterator<Trendbar[]> {
  const MIN = 60000;
  const lower = lowerBoundary(h4, h1, m5);
  const upper = upperBoundary(h4, h1, m5);
  let time = lower;
  while (time < upper) {
    yield snapshot(time, h4, h1, m5);
    time += MIN;
  }
}
