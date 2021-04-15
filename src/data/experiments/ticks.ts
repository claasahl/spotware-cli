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

async function mkdir(dir: string): Promise<void> {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore... for now
  }
}

async function saveTickData(options: SaveTickDataOptions): Promise<void> {
  const step = 604800000;
  const { ctidTraderAccountId, symbolId, type } = options;
  let { toTimestamp } = options;
  let hasMore = true;
  do {
    const fromTimestamp = Math.max(toTimestamp - step, options.fromTimestamp);
    console.log("fetching", [{ fromTimestamp, toTimestamp }].map(a));
    const response = await R.PROTO_OA_GET_TICKDATA_REQ(options.socket, {
      ctidTraderAccountId,
      symbolId,
      type,
      fromTimestamp,
      toTimestamp,
    });

    if (response.tickData.length > 0) {
      const tickData = response.tickData;
      for (let i = 1; i < tickData.length; i++) {
        tickData[i].timestamp =
          tickData[i - 1].timestamp + tickData[i].timestamp;
        tickData[i].tick = tickData[i - 1].tick + tickData[i].tick;
      }
      const period = {
        fromTimestamp: tickData[tickData.length - 1].timestamp,
        toTimestamp,
      };
      toTimestamp = period.fromTimestamp;

      await DB.write(options.path, period, tickData);
    } else if (response.tickData.length === 0) {
      const period = {
        fromTimestamp,
        toTimestamp,
      };
      toTimestamp = fromTimestamp;

      await DB.write(options.path, period, []);
    }

    hasMore = response.hasMore;
  } while (hasMore);
}

function a(period: DB.Period) {
  return {
    fromTimestamp: new Date(period.fromTimestamp).toISOString(),
    toTimestamp: new Date(period.toTimestamp).toISOString(),
  };
}

type FetchTickDataOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  symbolName: string;
  type: ProtoOAQuoteType;
  fromTimestamp: number;
  toTimestamp: number;
};
async function fetchTickData(options: FetchTickDataOptions) {
  const period: DB.Period = {
    fromTimestamp: options.fromTimestamp,
    toTimestamp: options.toTimestamp,
  };

  // prepare dir
  const dir = `${options.symbolName}.DB/${ProtoOAQuoteType[options.type]}`;
  await mkdir(dir);
  const available = await DB.readPeriods(dir);
  console.log("available", available.map(a));
  const periods = DB.retainUnknownPeriods(period, available);
  console.log("period", [period].map(a));
  console.log("remaining", periods.map(a));

  // fetch data
  for (const period of periods) {
    console.log("------------------");
    await saveTickData({
      ...options,
      ...period,
      path: dir,
    });
  }
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

    console.log("--------------------------------------");
    const ctidTraderAccountId = data.trader.ctidTraderAccountId;
    const fromTimestamp = options.fromDate.getTime();
    const toTimestamp = options.toDate.getTime();
    const symbolId = data.symbol.symbolId;
    const symbolName = data.symbol.symbolName?.replace("/", "") || "";
    await fetchTickData({
      socket,
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
      symbolId,
      symbolName,
      type: ProtoOAQuoteType.ASK,
    });
    // await fetchTickData({
    //   socket,
    //   ctidTraderAccountId,
    //   fromTimestamp,
    //   toTimestamp,
    //   symbolId,
    //   symbolName,
    //   type: ProtoOAQuoteType.BID
    // })
  };
}
export default processor;
