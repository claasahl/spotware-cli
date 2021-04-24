import { upper, lower } from "indicators";

import { Trendbar } from "../../../utils";

type StructurePoint = {
  timestamp: number;
  direction: "up" | "down";
  value: number;
  trendbar: Trendbar;
};

export function structurePoints(trendbars: Trendbar[]): StructurePoint[] {
  const data: {
    reference: Trendbar | null;
    direction: "up" | "down";
    structurePoints: StructurePoint[];
  } = { reference: null, direction: "up", structurePoints: [] };
  for (const trendbar of trendbars) {
    if (!data.reference) {
      data.reference = trendbar;
      continue;
    }

    switch (data.direction) {
      case "up": {
        if (
          upper(data.reference) < upper(trendbar) ||
          data.reference.high < trendbar.high
        ) {
          data.reference = trendbar;
          continue;
        }
        break;
      }
      case "down": {
        if (
          data.reference.low > trendbar.low ||
          lower(data.reference) > lower(trendbar)
        ) {
          data.reference = trendbar;
          continue;
        }
        break;
      }
    }

    data.structurePoints.push({
      timestamp: data.reference.timestamp,
      direction: data.direction,
      value: data.direction === "up" ? data.reference.high : data.reference.low,
      trendbar: data.reference,
    });
    data.reference = trendbar;
    data.direction = data.direction === "up" ? "down" : "up";
  }
  return data.structurePoints;
}
