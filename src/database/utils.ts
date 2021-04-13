import { comparePeriod, Period } from "./types";

/**
 * Tests whether `value` is situated between the referenced thresholds.
 *
 * @param value
 * @param threshold1 lower threshold (inclusive)
 * @param threshold2 upper threshold (exclusive)
 * @returns `true`, if `value` is between the two thresholds
 */
export function isBetween(
  value: number,
  threshold1: number,
  threshold2: number
): boolean {
  const upper = Math.max(threshold1, threshold2);
  const lower = Math.min(threshold1, threshold2);
  return lower <= value && value < upper;
}

export function engulfs(a: Period, b: Period): boolean {
  // a: --------------
  // b:    --------

  // a: --------
  // b: --------
  return a.fromTimestamp <= b.fromTimestamp && b.toTimestamp <= a.toTimestamp;
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
    isBetween(a.fromTimestamp, b.fromTimestamp, b.toTimestamp) ||
    isBetween(a.toTimestamp, b.fromTimestamp, b.toTimestamp) ||
    isBetween(b.fromTimestamp, a.fromTimestamp, a.toTimestamp) ||
    isBetween(b.toTimestamp, a.fromTimestamp, a.toTimestamp)
  );
}

export function intersection(a: Period, b: Period): Period | undefined {
  if (intersects(a, b)) {
    const fromTimestamp = Math.max(a.fromTimestamp, b.fromTimestamp);
    const toTimestamp = Math.min(a.toTimestamp, b.toTimestamp);
    return {
      fromTimestamp,
      toTimestamp,
    };
  }
  return undefined;
}

export function disjunction(a: Period, b: Period): Period[] {
  if (!intersects(a, b)) {
    return [a, b];
  } else if (comparePeriod(a, b) === 0) {
    return []; // periods are identical
  }

  // a: --------
  // b: --------

  // a: ------------
  // b:     --------

  // a: ------------
  // b: --------
  if (a.fromTimestamp === b.fromTimestamp) {
    return [
      {
        fromTimestamp: Math.min(a.toTimestamp, b.toTimestamp),
        toTimestamp: Math.max(a.toTimestamp, b.toTimestamp),
      },
    ];
  }
  if (a.toTimestamp === b.toTimestamp) {
    return [
      {
        fromTimestamp: Math.min(a.fromTimestamp, b.fromTimestamp),
        toTimestamp: Math.max(a.fromTimestamp, b.fromTimestamp),
      },
    ];
  }

  // a: --------
  // b:     --------

  // a: --------
  // b:        --------

  // a: -------------
  // b:    --------
  return [
    {
      fromTimestamp: Math.min(a.fromTimestamp, b.fromTimestamp),
      toTimestamp: Math.max(a.fromTimestamp, b.fromTimestamp),
    },
    {
      fromTimestamp: Math.min(a.toTimestamp, b.toTimestamp),
      toTimestamp: Math.max(a.toTimestamp, b.toTimestamp),
    },
  ];
}
