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
  if (counts.down !== counts.up) {
    data.structurePoints.push({
      timestamp: trendbars[0].timestamp,
      direction: counts.down > counts.up ? "up" : "down",
      value: counts.down > counts.up ? trendbars[0].high : trendbars[0].low,
      trendbar: trendbars[0],
    });
  }
  for (const trendbar of trendbars.slice(1)) {
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

export type StructurePoint2 = StructurePoint & { mitigatedBy?: Trendbar };

export function structurePoints2(trendbars: Trendbar[]): StructurePoint2[] {
  const points2: StructurePoint2[] = [];
  const points = structurePoints(trendbars);
  for (const point of points) {
    const { timestamp, value } = point;
    const bars = trendbars
      .filter((b) => b.timestamp > timestamp)
      .filter((b) => b.high >= value && value >= b.low);
    if (bars.length > 0) {
      points2.push({ ...point, mitigatedBy: bars[0] });
    } else {
      points2.push({ ...point });
    }
  }
  return points2;
}

export type TrendThingy = {
  type: "up" | "down" | "side";
  points: StructurePoint2[];
};

export function trend(points: StructurePoint2[]): TrendThingy[] {
  const data: TrendThingy[] = [];
  let reference: TrendThingy = { type: "side", points: [] };
  for (let index = 3; index < points.length; index++) {
    const pointA = points[index - 3];
    const pointB = points[index - 2];
    const pointC = points[index - 1];
    const pointD = points[index];
    const up = pointA.value < pointC.value && pointB.value < pointD.value;
    const down = pointA.value > pointC.value && pointB.value > pointD.value;
    const type = up ? "up" : down ? "down" : "side";

    if (reference.type === type) {
      reference.points.push(pointD);
    } else {
      data.push(reference);
      reference = { type, points: [pointA, pointB, pointC, pointD] };
    }
  }
  if (reference) {
    data.push(reference);
  }
  return data;
}
