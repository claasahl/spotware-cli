import { Period } from "./types";

/**
 * Tests whether `value` is situated between the referenced thresholds.
 *
 * @param value
 * @param threshold1
 * @param threshold2
 * @param inclusive whether the `value` may also overlap with the thresholds
 * @returns `true`, if `value` is between the two thresholds
 */
export function isBetween(
  value: number,
  threshold1: number,
  threshold2: number,
  inclusive = true
): boolean {
  const upper = Math.max(threshold1, threshold2);
  const lower = Math.min(threshold1, threshold2);
  if (inclusive) {
    return lower <= value && value <= upper;
  }
  return lower < value && value < upper;
}

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

export function intersects(a: Period, b: Period): boolean {
  // a: --------
  // b: --------

  // a: --------
  // b:     --------

  // a: ------------
  // b:     --------

  // a: --------
  // b:        --------

  // a: -------------
  // b:    --------
  return (
    a.type === b.type &&
    (isBetween(a.fromTimestamp, b.fromTimestamp, b.toTimestamp) ||
      isBetween(a.toTimestamp, b.fromTimestamp, b.toTimestamp) ||
      isBetween(b.fromTimestamp, a.fromTimestamp, a.toTimestamp) ||
      isBetween(b.toTimestamp, a.fromTimestamp, a.toTimestamp))
  );
}

export function intersection(a: Period, b: Period): Period | undefined {
  if (intersects(a, b)) {
    const fromTimestamp = Math.max(a.fromTimestamp, b.fromTimestamp);
    const toTimestamp = Math.min(a.toTimestamp, b.toTimestamp);
    return {
      fromTimestamp,
      toTimestamp,
      type: a.type,
    };
  }
  return undefined;
}
