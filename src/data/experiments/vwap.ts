import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import fs from "fs";
import git from "isomorphic-git";

import * as utils from "../../utils";
import { toLiveTrendbar } from "../utils";
import { Experiment } from "./types";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
}

interface Result {
  symbolId: number;
  vwap?: number;
}
export function vwap(options: Options) {
  const VWAP = utils.vwap(options);
  return (_timestamp: number, msg: Messages): Result | undefined => {
    const data = VWAP(msg);
    return {
      symbolId: options.symbolId,
      vwap: data,
    };
  };
}

const csvHeaders = [
  "volume",
  "open",
  "high",
  "low",
  "close",
  "period",
  "timestamp",
  "date",
  "vwap",
];

const csvData = (trendbar: utils.Trendbar, result?: Result) => [
  trendbar.volume,
  trendbar.open,
  trendbar.high,
  trendbar.low,
  trendbar.close,
  trendbar.period,
  trendbar.timestamp,
  new Date(trendbar.timestamp).toISOString(),
  result?.vwap,
];

export const run: Experiment = async (options, backtest) => {
  // prepare CSV file
  const { symbol, period } = options;
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const stream = format({ headers: csvHeaders });
  const output = fs.createWriteStream(
    `./vwap-${symbol.replace("/", "")}-${
      ProtoOATrendbarPeriod[period]
    }-${oid}.csv`
  );
  stream.pipe(output);

  // run strategy / analysis
  return backtest({
    ...options,
    strategy: (options) => {
      const strategy = vwap(options);
      return (trendbar) => {
        const message = toLiveTrendbar(options, trendbar);
        const result = strategy(trendbar.timestamp, message);
        stream.write(csvData(trendbar, result));
      };
    },
    done: () => stream.end(),
  });
};
export default run;
