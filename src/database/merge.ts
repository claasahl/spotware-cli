import { Period } from "./types";
import { engulfs, overlaps } from "./utils";

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
