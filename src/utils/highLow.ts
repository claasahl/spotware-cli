import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";

import { bufferedTrendbars, Trendbar } from "./trendbar";

function findHighsAndLows(bars: Trendbar[]) {
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

interface SmaOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
}
export function highLow(options: SmaOptions) {
  const lows: Trendbar[] = [];
  const highs: Trendbar[] = [];
  return (
    message: Messages
  ):
    | {
        lows: Trendbar[];
        highs: Trendbar[];
        newLow: boolean;
        newHigh: boolean;
        msSinceLastReset: number;
        msUntilNextReset: number;
        msBetweenResets: number;
      }
    | undefined => {
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES:
        return proto_oa_get_trendbars_res(message);
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        return proto_oa_spot_event(message);
      default:
        return value();
    }
  };
}
