import {
  ProtoOAQuoteType,
  ProtoOATickData,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";

import * as R from "../requests";

const FACTOR = Math.pow(10, 5);
const INTERVAL = ms("1min");

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
  return spots;
}

async function loadInterval(
  socket: SpotwareClientSocket,
  ctidTraderAccountId: number,
  symbolId: number,
  interval: Interval
) {
  const [asks, bids] = await Promise.all([
    R.PROTO_OA_GET_TICKDATA_REQ(socket, {
      ctidTraderAccountId,
      symbolId,
      type: ProtoOAQuoteType.ASK,
      fromTimestamp: interval.from,
      toTimestamp: interval.to,
    }),
    R.PROTO_OA_GET_TICKDATA_REQ(socket, {
      ctidTraderAccountId,
      symbolId,
      type: ProtoOAQuoteType.BID,
      fromTimestamp: interval.from,
      toTimestamp: interval.to,
    }),
  ]);
  if (asks.hasMore || bids.hasMore) {
    throw new Error("interval size too small");
  }
  const askTicks = inflate(asks.tickData);
  const bidTicks = inflate(bids.tickData);
  console.log(askTicks.length, bidTicks.length);
}

export interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  loadThisMuchHistoricalData: string;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<void> {
  const { ctidTraderAccountId, symbolId } = options;
  const toTimestamp = Date.now();
  const fromTimestamp = toTimestamp - ms(options.loadThisMuchHistoricalData);
  for (const interval of intervals(fromTimestamp, toTimestamp)) {
    await loadInterval(socket, ctidTraderAccountId, symbolId, interval);
  }
  await R.PROTO_OA_SUBSCRIBE_SPOTS_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
}
