import { Period } from "./types";

function engulfs(a: Period, b: Period): boolean {
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

function overlaps(a: Period, b: Period): boolean {
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

export function merge(a: Period, b: Period): Period[] {
  if (engulfs(a, b)) {
    return [a];
  } else if (engulfs(b, a)) {
    return [b];
  } else if (overlaps(a, b) || overlaps(b, a)) {
    return [
      {
        type: a.type,
        fromTimestamp: Math.min(a.fromTimestamp, b.fromTimestamp),
        toTimestamp: Math.max(a.toTimestamp, b.toTimestamp),
      },
    ];
  }
  return [a, b];
}
