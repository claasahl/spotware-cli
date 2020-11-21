import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import fs from "fs";
import git from "isomorphic-git";

import * as utils from "../../utils";
import { Trendbar } from "../../utils";
import { Experiment } from "./types";

function findHighsAndLows(bars: Trendbar[]) {
  const lows: Trendbar[] = [];
  const highs: Trendbar[] = [];
  for (const bar of bars) {
    const low = lows[lows.length - 1];
    if (!low || bar.low < low.low) {
      lows.push(bar);
    }

    const high = highs[highs.length - 1];
    if (!high || bar.high > high.high) {
      highs.push(bar);
    }
  }
  const merged = [
    ...lows.map((l) => ({ ...l, type: "low" })),
    ...highs.map((l) => ({ ...l, type: "high" })),
  ].sort((a, b) => a.timestamp - b.timestamp);
  const trimmedLows: Trendbar[] = [];
  const trimmedHighs: Trendbar[] = [];
  merged.forEach((curr, index, arr) => {
    if (index === 0) {
      return;
    }
    const prev = arr[index - 1];
    if (prev.type !== curr.type && prev.type === "low") {
      trimmedLows.push(prev);
    } else if (prev.type !== curr.type && prev.type === "high") {
      trimmedHighs.push(prev);
    }
    if (index === arr.length - 1 && curr.type === "low") {
      trimmedLows.push(curr);
    } else if (index === arr.length - 1 && curr.type === "high") {
      trimmedHighs.push(curr);
    }
  });
  return { lows: trimmedLows, highs: trimmedHighs };
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
  "highPrice1",
  "highPrice1Timestamp",
  "lowPrice1",
  "lowPrice1Timestamp",
  "highPrice2",
  "highPrice2Timestamp",
  "lowPrice2",
  "lowPrice2Timestamp",
];

function high(bar?: Trendbar) {
  if (!bar) {
    return [undefined, undefined];
  }
  return [bar.high, bar.timestamp];
}
function low(bar?: Trendbar) {
  if (!bar) {
    return [undefined, undefined];
  }
  return [bar.low, bar.timestamp];
}
const csvData = (
  trendbar: utils.Trendbar,
  highs: Trendbar[],
  lows: Trendbar[]
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
        const { highs, lows } = findHighsAndLows(future);
        stream.write(csvData(trendbar, highs.reverse(), lows.reverse()));
      };
    },
    done: () => stream.end(),
  });
};
export default run;
