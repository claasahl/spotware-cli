import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "../client/requests";
import { Trendbar, toTrendbar, isTrendbar, period } from "../utils";

function interval(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.D1:
      return 31622400000;
    case ProtoOATrendbarPeriod.H1:
    case ProtoOATrendbarPeriod.M30:
    case ProtoOATrendbarPeriod.M15:
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
    yield result.trendbar
      .filter(isTrendbar)
      .map((bar) => toTrendbar(bar, period));
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
      const future = foresight.slice(start, start + end);
      options.cb(bar, future);

      // get rid of "used" data
      const count = foresight.findIndex((f) => f.timestamp >= bar.timestamp);
      if (count >= 0) {
        foresight.splice(0, count);
      }
    }
  }
}

export function overlap(bars: Trendbar[]) {
  for (let index = 0; index < bars.length - 1; index++) {
    const open = bars[index].timestamp;
    const close = bars[index].timestamp + period(bars[index].period);
    for (let offset = index + 1; offset < bars.length; offset++) {
      const refOpen = bars[offset].timestamp;
      const refClose = bars[offset].timestamp + period(bars[offset].period);
      if (open <= refOpen && refClose <= close) {
        // ok
        continue;
      } else if (refOpen <= open && close <= refClose) {
        // ok
        continue;
      }
      return false;
    }
  }
  return true;
}

interface MultiPeriodOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  periods: ProtoOATrendbarPeriod[];
  fromDate: Date;
  toDate: Date;
  cb: (trendbar: Trendbar[]) => Promise<void>;
}
export async function multiPeriodDownload(
  socket: SpotwareClientSocket,
  options: MultiPeriodOptions
): Promise<void> {
  const periods = options.periods
    .map((p, index) => ({ period: p, millis: period(p), index }))
    .sort((a, b) => a.millis - b.millis);
  console.log(periods);
  const data = await Promise.all(
    periods.map(async (p) => {
      const iterator = chunks(socket, { ...options, period: p.period });
      return { ...p, iterator, result: await iterator.next() };
    })
  );
  const refresh = async (index: number) => {
    const d = data[index];
    if (d.result.value && d.result.value.length === 0 && !d.result.done) {
      d.result = await d.iterator.next();
    }
  };
  const cleanup = async () => {
    // always remove the highest-period bar (i.e. M1)
    if (data[0].result.value) {
      data[0].result.value.splice(0, 1);
      await refresh(0);
    }
    if (!data[0].result.value) {
      // probably no more data ...
      return;
    }

    // remove lower-period bars, if necessary
    for (let index = 0; index + 1 < data.length; index++) {
      while (
        !overlap([
          (data[index].result.value || [])[0],
          (data[index + 1].result.value || [])[0],
        ])
      ) {
        (data[index + 1].result.value || []).splice(0, 1);
        await refresh(index + 1);
      }
    }
  };
  while (data[0].result.value) {
    const values = data.map((d) => d.result.value || []);
    const bars = values.map((v) => v[0]);
    if (overlap(bars)) {
      await options.cb(bars);
      await cleanup();
    }
  }
  // const result = await iterators[0].next();
  // if (result.value) {
  //   const tmp: Trendbar[] = [];
  //   result.value.forEach(v => {
  //     tmp[periods[0].index] = v;
  //     options.cb(tmp);
  //   })
  // }
  // if(result.done) {

  // }
}
