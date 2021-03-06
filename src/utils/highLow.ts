import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";

import { Trendbar, trendbars } from "./trendbar";

export function findHighsAndLows(bars: Trendbar[]) {
  const lows: Trendbar[] = [];
  const highs: Trendbar[] = [];
  for (const bar of bars) {
    const low = lows[lows.length - 1];
    if (!low || bar.low < low.low) {
      lows.push(bar);
    }

    const high = highs[highs.length - 1];
    if (!high || bar.high > high.high) {
      highs.push(bar);
    }
  }
  const merged = [
    ...lows.map((l) => ({ ...l, type: "low" })),
    ...highs.map((l) => ({ ...l, type: "high" })),
  ].sort((a, b) => a.timestamp - b.timestamp);
  const trimmedLows: Trendbar[] = [];
  const trimmedHighs: Trendbar[] = [];
  const trimmed: Trendbar[] = [];
  merged.forEach((curr, index, arr) => {
    if (index === 0) {
      return;
    }
    const prev = arr[index - 1];
    if (prev.type !== curr.type && prev.type === "low") {
      trimmedLows.push(prev);
      trimmed.push(prev);
    } else if (prev.type !== curr.type && prev.type === "high") {
      trimmedHighs.push(prev);
      trimmed.push(prev);
    }
    if (index === arr.length - 1 && curr.type === "low") {
      trimmedLows.push(curr);
      trimmed.push(curr);
    } else if (index === arr.length - 1 && curr.type === "high") {
      trimmedHighs.push(curr);
      trimmed.push(curr);
    }
  });
  return { lows: trimmedLows, highs: trimmedHighs, merged: trimmed };
}

export interface HighLowOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
}
export interface HighLowResults {
  timestamp: number;

  high: number;
  highTimestamp: number;
  newHigh: boolean;

  low: number;
  lowTimestamp: number;
  newLow: boolean;
}
export function highLow(options: HighLowOptions) {
  const result = {
    timestamp: 0,
    high: Number.MIN_VALUE,
    highTimestamp: 0,
    low: Number.MAX_VALUE,
    lowTimestamp: 0,
  };
  return (msg: Messages): HighLowResults | undefined => {
    const preliminaryResult =
      result.timestamp === 0
        ? undefined
        : { ...result, newHigh: false, newLow: false };
    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return preliminaryResult;
    } else if (
      msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId
    ) {
      return preliminaryResult;
    } else if (msg.payload.symbolId !== options.symbolId) {
      return preliminaryResult;
    }

    const bars = trendbars(msg).filter((bar) => bar.period === options.period);
    if (bars.length === 0) {
      return preliminaryResult;
    } else if (bars.length !== 1) {
      throw new Error("how could I have not seen this coming?");
    }

    const { timestamp, high, low } = bars[0];
    const newTimestamp = result.timestamp !== timestamp;
    const newHigh = newTimestamp || result.high < high;
    const newLow = newTimestamp || result.low > low;
    result.timestamp = timestamp;
    result.high = newHigh ? high : result.high;
    result.highTimestamp = newHigh ? timestamp : result.highTimestamp;
    result.low = newLow ? low : result.low;
    result.lowTimestamp = newLow ? timestamp : result.lowTimestamp;
    return { ...result, newHigh, newLow };
  };
}
