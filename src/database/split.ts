import { Period } from "./types";
import { intersection, disjunction } from "./utils";

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

  const data: Period[] = [];
  for (const sample of available) {
    const tmp = disjunction(period, sample);
    data.push(...tmp);
  }
  return data;
}
