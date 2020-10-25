import {
  SpotwareClientSocket,
  ProtoOAQuoteType,
  ProtoOATickData,
} from "@claasahl/spotware-adapter";
import ms from "ms";

import { SpotEvent } from "../events";
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
  return spots.reverse();
}

function merge(
  deflatedAskTicks: ProtoOATickData[],
  deflatedBidTicks: ProtoOATickData[]
) {
  const asks = inflate(deflatedAskTicks);
  const bids = inflate(deflatedBidTicks);
  const spots: Omit<SpotEvent, "ctidTraderAccountId" | "symbolId">[] = [];
  while (asks.length > 0 || bids.length > 0) {
    if (asks.length > 0 && bids.length > 0) {
      if (asks[0].timestamp === bids[0].timestamp) {
        spots.push({
          date: new Date(asks[0].timestamp),
          ask: asks[0].tick,
          bid: bids[0].tick,
        });
        asks.shift();
        bids.shift();
      } else if (asks[0].timestamp < bids[0].timestamp) {
        spots.push({
          date: new Date(asks[0].timestamp),
          ask: asks[0].tick,
        });
        asks.shift();
      } else if (asks[0].timestamp > bids[0].timestamp) {
        spots.push({
          date: new Date(bids[0].timestamp),
          bid: bids[0].tick,
        });
        bids.shift();
      }
    } else if (asks.length > 0) {
      spots.push({
        date: new Date(asks[0].timestamp),
        ask: asks[0].tick,
      });
      asks.shift();
    } else if (bids.length > 0) {
      spots.push({
        date: new Date(bids[0].timestamp),
        bid: bids[0].tick,
      });
      bids.shift();
    }
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
  return merge(asks.tickData, bids.tickData);
}

export interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  loadThisMuchHistoricalData?: string;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<SpotEvent[]> {
  const { ctidTraderAccountId, symbolId } = options;
  const spots: SpotEvent[] = [];
  if (options.loadThisMuchHistoricalData) {
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - ms(options.loadThisMuchHistoricalData);
    for (const interval of intervals(fromTimestamp, toTimestamp)) {
      const chunk = await loadInterval(
        socket,
        ctidTraderAccountId,
        symbolId,
        interval
      );
      chunk.forEach((c) => spots.push({ ctidTraderAccountId, symbolId, ...c }));
    }
  }
  await R.PROTO_OA_SUBSCRIBE_SPOTS_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  return spots;
}
