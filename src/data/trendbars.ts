import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "../client/requests";
import { Trendbar, toTrendbar, isTrendbar } from "../utils";

function interval(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.H1:
      return 21168000000;
    case ProtoOATrendbarPeriod.M5:
      return 3024000000;
    case ProtoOATrendbarPeriod.M1:
      return 604800000;
    default:
      return 99999999999;
  }
}

function boundaries(
  options: Pick<Options, "fromDate" | "toDate" | "period">
): number[] {
  const fromTimestamp = options.fromDate.getTime();
  const toTimestamp = options.toDate.getTime();
  const boundaries: number[] = [fromTimestamp];
  const step = interval(options.period);
  while (boundaries[boundaries.length - 1] + step < toTimestamp) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }
  boundaries.push(toTimestamp);
  return boundaries;
}

async function* chunks(
  socket: SpotwareClientSocket,
  options: Pick<
    Options,
    "ctidTraderAccountId" | "symbolId" | "period" | "fromDate" | "toDate"
  >
) {
  const { ctidTraderAccountId, symbolId, period } = options;
  const tmp = boundaries(options);
  for (let i = 1; i < tmp.length; i++) {
    const fromTimestamp = tmp[i - 1];
    const toTimestamp = tmp[i];
    const result = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
      ctidTraderAccountId,
      period,
      symbolId,
      fromTimestamp,
      toTimestamp,
    });
    yield result.trendbar.filter(isTrendbar).map(toTrendbar);
  }
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  fromDate: Date;
  toDate: Date;
  cb: (trendbar: Trendbar) => void;
}
export async function download(socket: SpotwareClientSocket, options: Options) {
  for await (const chunk of chunks(socket, options)) {
    chunk.forEach(options.cb);
  }
}
interface Options2 {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  fromDate: Date;
  toDate: Date;
  foresight: {
    period: ProtoOATrendbarPeriod;
    offset: number;
  };
  cb: (trendbar: Trendbar, future: Trendbar[]) => void;
}

export async function dualDownload(
  socket: SpotwareClientSocket,
  options: Options2
) {
  const iter = chunks(socket, {
    ctidTraderAccountId: options.ctidTraderAccountId,
    symbolId: options.symbolId,
    period: options.foresight.period,
    fromDate: options.fromDate,
    toDate: new Date(options.toDate.getTime() + options.foresight.offset),
  });
  const foresight: Trendbar[] = [];
  for await (const chunk of chunks(socket, options)) {
    for (const bar of chunk) {
      // make sure that we have enough data cached
      const futureTimestamp = options.foresight.offset + bar.timestamp;
      while (
        foresight.length === 0 ||
        foresight[foresight.length - 1].timestamp < futureTimestamp
      ) {
        const result = await iter.next();
        if (result.value) {
          foresight.splice(foresight.length, 0, ...result.value);
        }
        if (result.done) {
          break;
        }
      }

      // ... do what we have come to do
      const start = foresight.findIndex((f) => f.timestamp >= bar.timestamp);
      const end = foresight
        .slice(start)
        .findIndex((f) => f.timestamp > futureTimestamp);
      const future = foresight.slice(start, end);
      options.cb(bar, future);

      // get rid of "used" data
      const count = foresight.findIndex((f) => f.timestamp >= bar.timestamp);
      if (count >= 0) {
        foresight.splice(0, count);
      }
    }
  }
}
