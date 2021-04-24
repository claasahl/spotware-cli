import fs from "fs";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import debug from "debug";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as DB from "../../database";
import * as U from "../../utils";

const log = debug("trendbars");

type SaveTrendbarsOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  symbolName: string;
  period: ProtoOATrendbarPeriod;
  fromTimestamp: number;
  toTimestamp: number;
  path: string;
};

async function saveTrendbars(options: SaveTrendbarsOptions): Promise<void> {
  const step = 3024000000;
  const { ctidTraderAccountId, symbolId, period } = options;

  let { toTimestamp } = options;
  do {
    const timePeriod: DB.Period = {
      fromTimestamp: Math.max(toTimestamp - step, options.fromTimestamp),
      toTimestamp,
    };
    log("%j", {
      period: DB.forHumans(timePeriod),
      msg: "fetching period",
    });

    const response = await R.PROTO_OA_GET_TRENDBARS_REQ(options.socket, {
      ctidTraderAccountId,
      symbolId,
      period,
      ...timePeriod,
    });
    if (
      response.trendbar.length > 0 &&
      response.trendbar[0].utcTimestampInMinutes
    ) {
      timePeriod.fromTimestamp =
        response.trendbar[0].utcTimestampInMinutes * 60000 -
        U.period(options.period);
    }

    await DB.writeTrendbars(
      options.path,
      timePeriod,
      period,
      response.trendbar
    );
    toTimestamp = timePeriod.fromTimestamp;
  } while (toTimestamp > options.fromTimestamp);
}

type FetchTrendbarsOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  symbolName: string;
  period: ProtoOATrendbarPeriod;
  fromTimestamp: number;
  toTimestamp: number;
};
async function fetchTrendbars(options: FetchTrendbarsOptions) {
  const period: DB.Period = {
    fromTimestamp: options.fromTimestamp,
    toTimestamp: options.toTimestamp,
  };

  // prepare dir
  const dir = `${options.symbolName}.DB/`;
  const available = await DB.readTrendbarPeriods(dir, options.period);
  const periods = DB.retainUnknownPeriods(period, available);
  log("%j", { period: DB.forHumans(period), msg: "period" });
  log("%j", { periods: periods.map(DB.forHumans), msg: "periods" });

  // fetch data
  for (const period of periods) {
    await saveTrendbars({
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
  period: ProtoOATrendbarPeriod;
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
    const period = options.period;
    await fetchTrendbars({
      socket,
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
      symbolId,
      symbolName,
      period,
    });
  };
}
export default processor;
