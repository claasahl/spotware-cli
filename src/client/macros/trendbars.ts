import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";

import { SpotEvent } from "../events";
import * as R from "../requests";

const FACTOR = Math.pow(10, 5);
const INTERVAL = ms("35d");

interface Interval {
  from: number;
  to: number;
}

function intervals(from: number, to: number): Interval[] {
  const chunks: Interval[] = [{ from, to: Math.min(to, from + INTERVAL) }];
  while (chunks[chunks.length - 1].to < to) {
    const last = chunks[chunks.length - 1];
    chunks.push({ from: last.to, to: Math.min(to, last.to + INTERVAL) });
  }
  return chunks;
}

function inflate(tickData: ProtoOATickData[]): ProtoOATickData[] {
  const acc: ProtoOATickData = { timestamp: 0, tick: 0 };
  const spots: ProtoOATickData[] = [];
  for (const t of tickData) {
    acc.timestamp += t.timestamp;
    acc.tick += t.tick;
    spots.push({
      timestamp: acc.timestamp,
      tick: acc.tick / FACTOR,
    });
  }
  return spots.reverse();
}

export interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  loadThisMuchHistoricalData?: string;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<void> {
  const { ctidTraderAccountId, symbolId, period } = options;
  if (options.loadThisMuchHistoricalData) {
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - ms(options.loadThisMuchHistoricalData);
    for (const interval of intervals(fromTimestamp, toTimestamp)) {
      const bars = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
        ctidTraderAccountId,
        fromTimestamp: interval.from,
        toTimestamp: interval.to,
        symbolId,
        period,
      });
      console.log(bars);
    }
  }
  await R.PROTO_OA_SUBSCRIBE_SPOTS_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  await R.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ(socket, {
    ctidTraderAccountId,
    symbolId: symbolId,
    period,
  });
}
