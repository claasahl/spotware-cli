import { Period } from "./types";

export function engulfs(a: Period, b: Period): boolean {
  // a: --------------
  // b:    --------

  // a: --------
  // b: --------
  return (
    a.type === b.type &&
    a.fromTimestamp <= b.fromTimestamp &&
    b.toTimestamp <= a.toTimestamp
  );
}

export function overlaps(a: Period, b: Period): boolean {
  // a: --------
  // b:     --------

  // a: ------------
  // b:     --------

  // a: --------
  // b:        --------
  return (
    a.type === b.type &&
    a.fromTimestamp < b.fromTimestamp &&
    a.toTimestamp <= b.toTimestamp &&
    b.fromTimestamp <= a.toTimestamp
  );
}
