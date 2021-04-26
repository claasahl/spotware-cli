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

const periods = [
  ProtoOATrendbarPeriod.W1,
  ProtoOATrendbarPeriod.D1,
  ProtoOATrendbarPeriod.H4,
];

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
    const results: {
      [key: string]: {
        trendbars: Trendbar[];
        points: U.StructurePoint2[];
        trend: U.TrendThingy[];
      };
    } = {};

    for (const period of periods) {
      const trendbars = await fetchTrendbars({
        socket,
        ctidTraderAccountId,
        symbolId,
        fromTimestamp,
        toTimestamp,
        period,
      });
      const points = U.structurePoints2(trendbars);
      const trend = U.trend(points);
      results[ProtoOATrendbarPeriod[period]] = { trendbars, points, trend };
    }
    fs.promises.writeFile(
      "structurePoints.json",
      JSON.stringify(results, null, 2)
    );
  };
}
export default processor;
