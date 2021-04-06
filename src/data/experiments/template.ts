import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "../runner/types";

interface Options {
  processSymbol: (data: SymbolData) => boolean;
}
function processor(options: Options): SymbolDataProcessor {
  return async (socket, data) => {
    if (!options.processSymbol(data)) {
      return;
    }
    const results = {
      data,
    };

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const ctid = data.trader.ctidTraderAccountId;
    const filename = `./template-${symbol}-${ctid}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results, null, 2));
  };
}
export default processor;
