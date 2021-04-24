import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import fs from "fs";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import * as U from "../../utils";
import { structurePoints } from "../../client/strategies/institutionalCandles/structurePoints";

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

    const response = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
      ctidTraderAccountId,
      symbolId,
      period,
      fromTimestamp,
      toTimestamp,
    });
    const trendbars = response.trendbar
      .filter(U.isTrendbar)
      .map((b) => U.toTrendbar(b, period));
    const points = structurePoints(trendbars);
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
