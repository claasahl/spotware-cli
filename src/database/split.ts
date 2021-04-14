import { comparePeriod, Period } from "./types";
import { intersects, intersection, disjunction } from "./utils";

export function retainAvailablePeriods(
  period: Period,
  available: Period[]
): Period[] {
  if (available.length === 0) {
    return [];
  }

  const data: Period[] = [];
  for (const sample of available) {
    const tmp = intersection(period, sample);
    if (tmp) {
      data.push(tmp);
    }
  }
  return data;
}

export function retainUnknownPeriods(
  period: Period,
  available: Period[]
): Period[] {
  if (available.length === 0) {
    return [period];
  }

  const data: Period[] = [period];
  for (const sample of available) {
    // remove available period
    // do the same for resulting output
    for (let index = 0; index < data.length; index++) {
      if (!intersects(data[index], sample)) {
        continue;
      }
      const tmp = disjunction(data[index], sample).filter((p) =>
        intersects(p, period)
      );
      console.log(index, data[index], sample, tmp);
      data.splice(index, 1, ...tmp);
    }
  }
  return data;
}
