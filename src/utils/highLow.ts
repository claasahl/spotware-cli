import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { Trendbar, bufferedTrendbars } from "./trendbar";

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
  merged.forEach((curr, index, arr) => {
    if (index === 0) {
      return;
    }
    const prev = arr[index - 1];
    if (prev.type !== curr.type && prev.type === "low") {
      trimmedLows.push(prev);
    } else if (prev.type !== curr.type && prev.type === "high") {
      trimmedHighs.push(prev);
    }
    if (index === arr.length - 1 && curr.type === "low") {
      trimmedLows.push(curr);
    } else if (index === arr.length - 1 && curr.type === "high") {
      trimmedHighs.push(curr);
    }
  });
  return { lows: trimmedLows, highs: trimmedHighs };
}

export interface HighLowOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export interface HighLowResults {
  lows: Trendbar[];
  highs: Trendbar[];
}
export function highLow(options: HighLowOptions) {
  const buffer = bufferedTrendbars(options);
  return (msg: Messages): HighLowResults | undefined => {
    const buffered = buffer(msg);
    const bars = buffered.bars.filter((b) => b);
    return findHighsAndLows(bars);
  };
}
