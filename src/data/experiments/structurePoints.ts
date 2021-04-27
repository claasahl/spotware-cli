import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import { bearish, bullish } from "indicators";
import fs from "fs";
import debug from "debug";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as U from "../../utils";
import * as DB from "../../database";

const log = debug("structure-points");

type OrderBlock = {
  timestamp: number;
  type: "bearish" | "bullish";
  bar: U.Trendbar;
};

function orderBlocks(
  bars: U.Trendbar[],
  _points: U.StructurePoint2[]
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  for (let i = 0; i + 1 < bars.length; i++) {
    const bar = bars[i];
    const next = bars[i + 1];

    if (bearish(bar) && bullish(next)) {
      orderBlocks.push({
        timestamp: bar.timestamp,
        type: "bearish",
        bar,
      });
    }
    if (bullish(bar) && bearish(next)) {
      orderBlocks.push({
        timestamp: bar.timestamp,
        type: "bullish",
        bar,
      });
    }
  }
  return orderBlocks;
}

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
): Promise<U.Trendbar[]> {
  const step = U.maxTrendbarPeriod(options.period);
  const { ctidTraderAccountId, symbolId, period } = options;
  const data: U.Trendbar[] = [];

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
        trendbars: U.Trendbar[];
        points: U.StructurePoint2[];
        orderBlocks: OrderBlock[];
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
      results[ProtoOATrendbarPeriod[period]] = {
        trendbars,
        points,
        orderBlocks: orderBlocks(trendbars, points),
        trend,
      };
    }
    fs.promises.writeFile(
      "structurePoints.json",
      JSON.stringify(results, null, 2)
    );
  };
}
export default processor;
