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
  period: ProtoOATrendbarPeriod;
  smaPeriods?: number;
}

interface Result {
  symbolId: number;
  SMARange?: number;
  SMABody?: number;
}
export function priceRange(options: Options) {
  const { ctidTraderAccountId, symbolId, period, smaPeriods = 200 } = options;
  const smaRange = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: smaPeriods,
    property: (b) => b.high - b.low,
  });
  const smaBody = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: smaPeriods,
    property: (b) => Math.abs(b.open - b.close),
  });
  return (_timestamp: number, msg: Messages): Result | undefined => {
    const SMARange = smaRange(msg);
    const SMABody = smaBody(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    const data = {
      symbolId,
      SMARange,
      SMABody,
    };
    return data;
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
  "SMARange",
  "SMABody",
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
  result?.SMARange,
  result?.SMABody,
];

export const run: Experiment = async (options, backtest) => {
  // prepare CSV file
  const { symbol, period } = options;
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const stream = format({ headers: csvHeaders });
  const output = fs.createWriteStream(
    `./price-range-${symbol.replace("/", "")}-${
      ProtoOATrendbarPeriod[period]
    }-${oid}.csv`
  );
  stream.pipe(output);

  // run strategy / analysis
  return backtest({
    ...options,
    strategy: (options) => {
      const strategy = priceRange(options);
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
