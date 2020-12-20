import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "./types";
import { multiPeriodDownload } from "../trendbars";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

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
    await multiPeriodDownload(socket, {
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      fromDate: options.fromDate,
      toDate: options.toDate,
      periods: [ProtoOATrendbarPeriod.D1, ProtoOATrendbarPeriod.M1],
      symbolId: data.symbol.symbolId,
      cb: () => {},
    });
    const results = {
      data,
    };

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const filename = `./high-low-${symbol}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results, null, 2));
  };
}
export default processor;
