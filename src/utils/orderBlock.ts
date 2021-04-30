import { bearish, bullish, range } from "indicators";

import { StructurePoint2 } from "./structurePoints";
import { Trendbar } from "./trendbar";

function brokenUpperStructurePoints(
  bar: Trendbar,
  tail: Trendbar[],
  points: StructurePoint2[]
): StructurePoint2[] {
  const tmp = points.filter(
    (p) => p.timestamp < bar.timestamp && p.direction === "up"
  );
  const before: StructurePoint2[] = [];
  if (tmp.length > 0) {
    let value = bar.high + range(bar);
    for (let i = tmp.length - 1; i >= 0; i--) {
      if (tmp[i].value >= value) {
        value = tmp[i].value;
        before.push(tmp[i]);
      }
    }
  }
  const endOfTail =
    tail.length === 0 ? bar.timestamp : tail[tail.length - 1].timestamp;
  const brokenStructurePoints = before
    .filter((p) => p.mitigatedBy && p.mitigatedBy.timestamp > bar.timestamp)
    .filter((p) => p.mitigatedBy && p.mitigatedBy.timestamp <= endOfTail);
  return brokenStructurePoints;
}

function brokenLowerStructurePoints(
  bar: Trendbar,
  tail: Trendbar[],
  points: StructurePoint2[]
): StructurePoint2[] {
  const tmp = points.filter(
    (p) => p.timestamp < bar.timestamp && p.direction === "down"
  );
  const before: StructurePoint2[] = [];
  if (tmp.length > 0) {
    let value = bar.low - range(bar);
    for (let i = tmp.length - 1; i >= 0; i--) {
      if (tmp[i].value <= value) {
        value = tmp[i].value;
        before.push(tmp[i]);
      }
    }
  }
  const endOfTail =
    tail.length === 0 ? bar.timestamp : tail[tail.length - 1].timestamp;
  const brokenStructurePoints = before
    .filter((p) => p.mitigatedBy && p.mitigatedBy.timestamp > bar.timestamp)
    .filter((p) => p.mitigatedBy && p.mitigatedBy.timestamp <= endOfTail);
  return brokenStructurePoints;
}

export type OrderBlock = {
  timestamp: number;
  type: "bearish" | "bullish";
  bar: Trendbar;
  bars: Trendbar[];
  points: StructurePoint2[];
};

export function orderBlocks(
  bars: Trendbar[],
  points: StructurePoint2[]
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  for (let i = 0; i + 1 < bars.length; i++) {
    const bar = bars[i];
    const next = bars[i + 1];
    const tail = bars.slice(i + 2, i + 5);

    const bullishTail = tail.filter(bullish).length === tail.length;
    if (bearish(bar) && bullish(next) && bullishTail) {
      const mitigatedBy = bars.slice(i + 2).findIndex((b) => b.low < bar.high);
      const tail =
        mitigatedBy === -1
          ? bars.slice(i + 1)
          : bars.slice(i + 1, i + 3 + mitigatedBy);
      const brokenStructurePoints = brokenUpperStructurePoints(
        bar,
        tail,
        points
      );
      if (brokenStructurePoints.length > 0) {
        orderBlocks.push({
          timestamp: bar.timestamp,
          type: "bearish",
          bar,
          bars: [bar, ...tail],
          points: brokenStructurePoints,
        });
      }
    }

    const bearishTail = tail.filter(bearish).length === tail.length;
    if (bullish(bar) && bearish(next) && bearishTail) {
      const mitigatedBy = bars.slice(i + 2).findIndex((b) => b.high < bar.low);
      const tail =
        mitigatedBy === -1
          ? bars.slice(i + 1)
          : bars.slice(i + 1, i + 3 + mitigatedBy);
      const brokenStructurePoints = brokenLowerStructurePoints(
        bar,
        tail,
        points
      );
      if (brokenStructurePoints.length > 0) {
        orderBlocks.push({
          timestamp: bar.timestamp,
          type: "bullish",
          bar,
          bars: [bar, ...tail],
          points: brokenStructurePoints,
        });
      }
    }
  }
  return orderBlocks;
}