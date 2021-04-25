import { upper, lower } from "indicators";

import { Trendbar } from ".";

type StructurePoint = {
  timestamp: number;
  direction: "up" | "down";
  value: number;
  trendbar: Trendbar;
};

function upwards(a: Trendbar, b: Trendbar): boolean {
  return upper(a) < upper(b) || a.high < b.high;
}

function downwards(a: Trendbar, b: Trendbar): boolean {
  return a.low > b.low || lower(a) > lower(b);
}

export function structurePoints(trendbars: Trendbar[]): StructurePoint[] {
  if (trendbars.length === 0) {
    return [];
  }

  const counts = {
    up: 0,
    down: 0,
  };
  for (let i = 1; i < trendbars.length; i++) {
    const prev = trendbars[i - 1];
    const curr = trendbars[i];
    counts.up += upwards(prev, curr) ? 1 : 0;
    counts.down += downwards(prev, curr) ? 1 : 0;
    if (counts.down !== counts.up) {
      break;
    }
  }

  const data: {
    reference: Trendbar;
    direction: "up" | "down";
    structurePoints: StructurePoint[];
  } = {
    reference: trendbars[0],
    direction: counts.down > counts.up ? "down" : "up",
    structurePoints: [],
  };
  for (const trendbar of trendbars) {
    switch (data.direction) {
      case "up": {
        if (upwards(data.reference, trendbar)) {
          data.reference = trendbar;
          continue;
        }
        break;
      }
      case "down": {
        if (downwards(data.reference, trendbar)) {
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
  if (
    data.structurePoints.length > 0 &&
    data.structurePoints[data.structurePoints.length - 1].trendbar !==
      data.reference &&
    data.reference
  ) {
    data.structurePoints.push({
      timestamp: data.reference.timestamp,
      direction: data.direction,
      value: data.direction === "up" ? data.reference.high : data.reference.low,
      trendbar: data.reference,
    });
  }
  return data.structurePoints;
}
