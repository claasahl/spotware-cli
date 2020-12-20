import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "./types";
import { multiPeriodDownload } from "../trendbars";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { Trendbar } from "../../utils";

interface Extremes {
  bar: Trendbar;
  extremes: (Trendbar & { value: number })[];
  low: number;
  high: number;
}
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
    const results: { data: SymbolData; extremes: Extremes[] } = {
      data,
      extremes: [],
    };
    await multiPeriodDownload(socket, {
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      fromDate: options.fromDate,
      toDate: options.toDate,
      periods: [ProtoOATrendbarPeriod.D1, ProtoOATrendbarPeriod.M1],
      symbolId: data.symbol.symbolId,
      cb: async (bars) => {
        const d1 = bars[1];
        const m1 = bars[0];
        const latest = results.extremes[results.extremes.length - 1];
        if (!latest || latest.bar.timestamp !== d1.timestamp) {
          const extreme: Extremes = {
            bar: d1,
            extremes: [{ ...m1, value: m1.open }],
            low: m1.low,
            high: m1.high,
          };
          results.extremes.push(extreme);
          return;
        }
        if (latest.high < m1.high) {
          latest.extremes.push({ ...m1, value: m1.high });
          latest.high = m1.high;
        }
        if (m1.low < latest.low) {
          latest.extremes.push({ ...m1, value: m1.low });
          latest.low = m1.low;
        }
      },
    });

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const filename = `./high-low-${symbol}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results, null, 2));
  };
}
export default processor;
