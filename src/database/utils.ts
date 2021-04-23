import {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";
import { join } from "path";

import { comparePeriod, Period } from "./types";

export function engulfs(a: Period, b: Period): boolean {
  // a: --------------
  // b:    --------

  // a: --------
  // b: --------
  return a.fromTimestamp <= b.fromTimestamp && b.toTimestamp <= a.toTimestamp;
}

export function touches(a: Period, b: Period): boolean {
  return a.fromTimestamp === b.toTimestamp || a.toTimestamp === b.fromTimestamp;
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
    (b.fromTimestamp <= a.fromTimestamp && a.fromTimestamp < b.toTimestamp) ||
    (b.fromTimestamp < a.toTimestamp && a.toTimestamp < b.toTimestamp) ||
    (a.fromTimestamp <= b.fromTimestamp && b.fromTimestamp < a.toTimestamp) ||
    (a.fromTimestamp < b.toTimestamp && b.toTimestamp < a.toTimestamp)
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

export function forHumans(period: Period) {
  return {
    fromTimestamp: new Date(period.fromTimestamp).toISOString(),
    toTimestamp: new Date(period.toTimestamp).toISOString(),
  };
}

export function quoteDir(dir: string, type: ProtoOAQuoteType): string {
  return join(dir, ProtoOAQuoteType[type]);
}

export function trendbarDir(dir: string, type: ProtoOATrendbarPeriod): string {
  return join(dir, ProtoOATrendbarPeriod[type]);
}
