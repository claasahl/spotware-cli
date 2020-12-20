import fs from "fs";
import git from "isomorphic-git";

import { SymbolDataProcessor } from "./types";

interface Options {}
function processor(options: Options): SymbolDataProcessor {
  return async (socket, data) => {
    const results = {
      data,
    };

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const filename = `./template-${symbol}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results, null, 2));
  };
}
export default processor;
