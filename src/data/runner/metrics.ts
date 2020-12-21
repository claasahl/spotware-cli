import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "./types";
import { multiPeriodDownload } from "../trendbars";
import * as utils from "../../utils";
import { toLiveTrendbar } from "../utils";

type Metric = utils.Trendbar & {
  smaVolume?: number;
  smaRange?: number;
  smaBody?: number;
  smaShortTerm?: number;
  smaLongTerm?: number;
  wpr?: number;
};
interface Options {
  processSymbol: (data: SymbolData) => boolean;
  fromDate: Date;
  toDate: Date;
  period: ProtoOATrendbarPeriod;
  periodsVolume?: number;
  periodsRange?: number;
  periodsBody?: number;
  periodsShortTerm?: number;
  periodsLongTerm?: number;
  periodsWPR?: number;
}
function processor(options: Options): SymbolDataProcessor {
  return async (socket, data) => {
    if (!options.processSymbol(data)) {
      return;
    }
    const { ctidTraderAccountId } = data.trader;
    const { symbolId } = data.symbol;
    const { period } = options;
    const metrics: Metric[] = [];
    const results = {
      data,
      metrics,
    };
    const volumeSma = utils.sma({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsVolume || 30,
      property: (b) => b.high - b.low,
    });
    const rangeSma = utils.sma({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsRange || 50,
      property: (b) => b.high - b.low,
    });
    const bodySma = utils.sma({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsBody || 50,
      property: (b) => Math.abs(b.open - b.close),
    });
    const shortTermSma = utils.sma({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsShortTerm || 50,
    });
    const longTermSma = utils.sma({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsLongTerm || 200,
    });
    const williamsPercentRange = utils.WilliamsPercentRange({
      ctidTraderAccountId,
      symbolId,
      period,
      periods: options.periodsWPR || 20,
    });
    await multiPeriodDownload(socket, {
      ctidTraderAccountId,
      fromDate: options.fromDate,
      toDate: options.toDate,
      periods: [period],
      symbolId,
      cb: async (bars) => {
        const bar = bars[0];
        const msg = toLiveTrendbar(
          { ctidTraderAccountId, period, symbolId },
          bar
        );
        metrics.push({
          ...bar,
          smaVolume: volumeSma(msg),
          smaRange: rangeSma(msg),
          smaBody: bodySma(msg),
          smaShortTerm: shortTermSma(msg),
          smaLongTerm: longTermSma(msg),
          wpr: williamsPercentRange(msg),
        });
      },
    });

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const filename = `./metrics-${symbol}-${oid}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(results));
  };
}
export default processor;
