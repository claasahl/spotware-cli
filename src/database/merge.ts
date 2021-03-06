import { Period } from "./types";
import { engulfs, intersects, touches } from "./utils";

export function merge(a: Period, b: Period): Period[] {
  if (engulfs(a, b)) {
    return [a];
  } else if (engulfs(b, a)) {
    return [b];
  } else if (intersects(a, b) || touches(a, b)) {
    return [
      {
        fromTimestamp: Math.min(a.fromTimestamp, b.fromTimestamp),
        toTimestamp: Math.max(a.toTimestamp, b.toTimestamp),
      },
    ];
  }
  return [a, b];
}
