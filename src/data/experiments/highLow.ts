import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import fs from "fs";
import git from "isomorphic-git";

import * as utils from "../../utils";
import { Experiment } from "./types";

const csvHeaders = [
  "volume",
  "open",
  "high",
  "low",
  "close",
  "period",
  "timestamp",
  "date",
  "highPrice1",
  "highPrice1Timestamp",
  "lowPrice1",
  "lowPrice1Timestamp",
  "highPrice2",
  "highPrice2Timestamp",
  "lowPrice2",
  "lowPrice2Timestamp",
  "json",
];

function high(bar?: utils.Trendbar) {
  if (!bar) {
    return [undefined, undefined];
  }
  return [bar.high, bar.timestamp];
}
function low(bar?: utils.Trendbar) {
  if (!bar) {
    return [undefined, undefined];
  }
  return [bar.low, bar.timestamp];
}
const csvData = (
  trendbar: utils.Trendbar,
  highs: utils.Trendbar[],
  lows: utils.Trendbar[],
  merged: utils.Trendbar[]
) => [
  trendbar.volume,
  trendbar.open,
  trendbar.high,
  trendbar.low,
  trendbar.close,
  trendbar.period,
  trendbar.timestamp,
  new Date(trendbar.timestamp).toISOString(),
  ...high(highs[0]),
  ...low(lows[0]),
  ...high(highs[1]),
  ...low(lows[1]),
  JSON.stringify(merged),
];

export const run: Experiment = async (options, backtest) => {
  // prepare CSV file
  const { symbol, period } = options;
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const stream = format({ headers: csvHeaders });
  const output = fs.createWriteStream(
    `./high-low-${symbol.replace("/", "")}-${
      ProtoOATrendbarPeriod[period]
    }-${oid}.csv`
  );
  stream.pipe(output);

  // run strategy / analysis
  return backtest({
    ...options,
    strategy: () => {
      return (trendbar, future) => {
        const { highs, lows, merged } = utils.findHighsAndLows(future);
        stream.write(
          csvData(trendbar, highs.reverse(), lows.reverse(), merged.reverse())
        );
      };
    },
    done: () => stream.end(),
  });
};
export default run;
