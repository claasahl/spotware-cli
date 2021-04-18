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

async function mkdir(dir: string): Promise<void> {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore... for now
  }
}

async function saveTrendbars(options: SaveTrendbarsOptions): Promise<void> {
  const step = 3024000000;
  const { ctidTraderAccountId, symbolId, period } = options;

  let { toTimestamp } = options;
  do {
    const fromTimestamp = Math.max(toTimestamp - step, options.fromTimestamp);
    const timePeriod: DB.Period = {
      fromTimestamp,
      toTimestamp,
    };
    log("%j", {
      period: a(timePeriod),
      msg: "fetching period",
    });

    const response = await R.PROTO_OA_GET_TRENDBARS_REQ(options.socket, {
      ctidTraderAccountId,
      symbolId,
      period,
      ...timePeriod,
    });

    await DB.write(options.path, timePeriod, response.trendbar);

    if (
      response.trendbar.length > 0 &&
      response.trendbar[0].utcTimestampInMinutes
    ) {
      toTimestamp =
        response.trendbar[0].utcTimestampInMinutes * 60000 -
        U.period(options.period);
    } else {
      toTimestamp = fromTimestamp;
    }
  } while (toTimestamp > options.fromTimestamp);
}

function a(period: DB.Period) {
  return {
    fromTimestamp: new Date(period.fromTimestamp).toISOString(),
    toTimestamp: new Date(period.toTimestamp).toISOString(),
  };
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
  const dir = `${options.symbolName}.DB/${
    ProtoOATrendbarPeriod[options.period]
  }`;
  await mkdir(dir);
  const available = await DB.readPeriods(dir);
  const periods = DB.retainUnknownPeriods(period, available);
  log("%j", { period: a(period), msg: "period" });
  log("%j", { periods: periods.map(a), msg: "periods" });

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
