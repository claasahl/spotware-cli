import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";

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
    const fromTimestamp = options.fromDate.getTime();
    const toTimestamp = options.toDate.getTime();
    const ticks = await R.PROTO_OA_GET_TICKDATA_REQ(socket, {
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      symbolId: data.symbol.symbolId,
      type: ProtoOAQuoteType.ASK,
      fromTimestamp,
      toTimestamp,
    });
    const results = {
      data,
      ticks,
    };

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const ctid = data.trader.ctidTraderAccountId;
    const filename = `./ticks-${symbol}-${ctid}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results, null, 2));
  };
}
export default processor;
