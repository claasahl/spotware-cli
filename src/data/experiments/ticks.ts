import fs from "fs";
import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import debug from "debug";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as DB from "../../database";

const log = debug("ticks");

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

async function saveTickData(options: SaveTickDataOptions): Promise<void> {
  const step = 604800000;
  const { ctidTraderAccountId, symbolId, type } = options;
  let { toTimestamp } = options;
  do {
    const fromTimestamp = Math.max(toTimestamp - step, options.fromTimestamp);
    log("%j", {
      period: DB.forHumans({ fromTimestamp, toTimestamp }),
      msg: "fetching period",
    });

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

      await DB.writeQuotes(options.path, period, type, tickData);
    } else if (response.tickData.length === 0) {
      const period = {
        fromTimestamp,
        toTimestamp,
      };
      toTimestamp = fromTimestamp;

      await DB.writeQuotes(options.path, period, type, []);
    }
  } while (toTimestamp > options.fromTimestamp);
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
  const dir = `${options.symbolName}.DB`;
  const available = await DB.readQuotePeriods(dir, options.type);
  const periods = DB.retainUnknownPeriods(period, available);
  log("%j", { period: DB.forHumans(period), msg: "period" });
  log("%j", { periods: periods.map(DB.forHumans), msg: "periods" });

  // fetch data
  for (const period of periods) {
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
    await fetchTickData({
      socket,
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
      symbolId,
      symbolName,
      type: ProtoOAQuoteType.BID,
    });
  };
}
export default processor;
