import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import debug from "debug";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";

const log = debug("trendbars");

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
    const symbolId = data.symbol.symbolId;
    const response = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
      ctidTraderAccountId,
      fromTimestamp: options.fromDate.getTime(),
      toTimestamp: options.toDate.getTime(),
      symbolId,
      period: options.period,
    });
    log("%j", response.trendbar);
  };
}
export default processor;
