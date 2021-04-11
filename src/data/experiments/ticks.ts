import fs from "fs";
import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as DB from "../../database";

type SaveTickDataOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  symbolName: string;
  type: ProtoOAQuoteType;
  fromTimestamp: number;
  toTimestamp: number;
  path: string;
};

type Period = {
  fromTimestamp: number;
  toTimestamp: number;
  type: ProtoOAQuoteType;
};

async function mkdir(dir: string): Promise<void> {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore... for now
  }
}

function removeOverlap(a: Period, b: Period): Period[] {
  if (
    a.type !== b.type ||
    b.toTimestamp < a.fromTimestamp ||
    a.toTimestamp < b.fromTimestamp
  ) {
    return [a];
  }
  const { type } = a;
  if (a.fromTimestamp <= b.fromTimestamp && b.toTimestamp <= a.toTimestamp) {
    // a completely engulfes b
    return [
      { fromTimestamp: a.fromTimestamp, toTimestamp: b.fromTimestamp, type },
      { fromTimestamp: b.toTimestamp, toTimestamp: a.toTimestamp, type },
    ];
  }
  if (b.fromTimestamp <= a.fromTimestamp && a.toTimestamp <= b.toTimestamp) {
    // b completely engulfes a
    return [];
  }
  if (
    a.fromTimestamp < b.fromTimestamp &&
    b.fromTimestamp < a.toTimestamp &&
    a.toTimestamp <= b.toTimestamp
  ) {
    // a reaches into b
    return [
      { fromTimestamp: a.fromTimestamp, toTimestamp: b.fromTimestamp, type },
    ];
  }
  if (
    b.fromTimestamp < a.fromTimestamp &&
    a.fromTimestamp < b.toTimestamp &&
    b.toTimestamp <= a.toTimestamp
  ) {
    // b reaches into a
    return [
      { fromTimestamp: a.fromTimestamp, toTimestamp: b.fromTimestamp, type },
    ];
  }
  return [a];
}

function removeOverlaps(
  periods: Period[],
  alreadyAvailable: Period[]
): Period[] {
  const data: Period[] = [...periods];

  for (const available of alreadyAvailable) {
    let index = 0;
    while (index < data.length) {
      const period = data[index];
      const tmp = removeOverlap(period, available);

      if (tmp.length === 1 && tmp[0] === period) {
        // no change
        index++;
      } else {
        data.splice(index, 1, ...tmp);
      }
    }
  }
  return data;
}

async function saveTickData(options: SaveTickDataOptions): Promise<void> {
  const step = 604800000;
  const { ctidTraderAccountId, symbolId, type } = options;
  let { toTimestamp } = options;
  let hasMore = true;
  do {
    const fromTimestamp = Math.max(
      options.toTimestamp - step,
      options.fromTimestamp
    );
    const response = await R.PROTO_OA_GET_TICKDATA_REQ(options.socket, {
      ctidTraderAccountId,
      symbolId,
      type,
      fromTimestamp,
      toTimestamp,
    });

    if (response.tickData.length > 0) {
      toTimestamp = response.tickData[0].timestamp;

      const tickData = response.tickData;
      for (let i = 1; i < tickData.length; i++) {
        tickData[i].timestamp =
          tickData[i - 1].timestamp + tickData[i].timestamp;
        tickData[i].tick = tickData[i - 1].tick + tickData[i].tick;
      }

      await DB.write(options.path, type, tickData);
    }

    hasMore = response.hasMore;
  } while (hasMore);
}

interface Options {
  processSymbol: (data: SymbolData) => boolean;
  fromDate: Date;
  toDate: Date;
}
function processor(options: Options): SymbolDataProcessor {
  return async (socket, data) => {
    if (!options.processSymbol(data)) {
      return;
    }

    const a: Period = {
      fromTimestamp: options.fromDate.getTime(),
      toTimestamp: options.toDate.getTime(),
      type: ProtoOAQuoteType.ASK,
    };
    const b: Period = {
      fromTimestamp: options.fromDate.getTime(),
      toTimestamp: options.toDate.getTime(),
      type: ProtoOAQuoteType.BID,
    };

    // prepare dir
    const symbolName = data.symbol.symbolName?.replace("/", "") || "";
    const dir = `${symbolName}.DB`;
    await mkdir(dir);
    const availablePeriods = await DB.readPeriods(dir);
    const periods = removeOverlaps([a, b], availablePeriods);
    console.log([a, b], periods, availablePeriods);

    // fetch data
    for (const period of periods) {
      await saveTickData({
        socket,
        ctidTraderAccountId: data.trader.ctidTraderAccountId,
        symbolId: data.symbol.symbolId,
        symbolName,
        path: dir,
        ...period,
      });
    }
  };
}
export default processor;
