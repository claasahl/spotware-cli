import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import fs from "fs";
import debug from "debug";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as U from "../../utils";
import * as DB from "../../database";
import { Trendbar } from "../../utils";

const log = debug("structure-points");

type FetchTrendbarsOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  fromTimestamp: number;
  toTimestamp: number;
};

async function fetchTrendbars(
  options: FetchTrendbarsOptions
): Promise<Trendbar[]> {
  const step = U.maxTrendbarPeriod(options.period);
  const { ctidTraderAccountId, symbolId, period } = options;
  const data: Trendbar[] = [];

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

    const bars = response.trendbar.filter(U.isTrendbar).map(U.toTrendbar);
    data.splice(0, 0, ...bars);
    toTimestamp = timePeriod.fromTimestamp;
  } while (toTimestamp > options.fromTimestamp);
  return data;
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
    const period = options.period;

    const trendbars = await fetchTrendbars({
      socket,
      ctidTraderAccountId,
      symbolId,
      fromTimestamp,
      toTimestamp,
      period: ProtoOATrendbarPeriod.W1,
    });
    const points = U.structurePoints(trendbars);
    const tmp = {
      trendbars: trendbars.map((b) => ({
        ...b,
        timestamp: new Date(b.timestamp),
      })),
      points: points.map((p) => ({ ...p, timestamp: new Date(p.timestamp) })),
    };
    fs.promises.writeFile("structurePoints.json", JSON.stringify(tmp, null, 2));
  };
}
export default processor;
