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
  periodsRange?: number;
  periodsBody?: number;
  periodsShortTerm?: number;
  periodsLongTerm?: number;
  periodsWPR?: number;
}

interface Result {
  symbolId: number;
  smaRange?: number;
  smaBody?: number;
  smaShortTerm?: number;
  smaLongTerm?: number;
  wpr?: number;
}
export function metrics(options: Options) {
  const { ctidTraderAccountId, symbolId, period } = options;
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
  return (_timestamp: number, msg: Messages): Result | undefined => {
    const smaRange = rangeSma(msg);
    const smaBody = bodySma(msg);
    const smaShortTerm = shortTermSma(msg);
    const smaLongTerm = longTermSma(msg);
    const wpr = williamsPercentRange(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    const data = {
      symbolId,
      smaRange,
      smaBody,
      smaShortTerm,
      smaLongTerm,
      wpr,
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
  "smaRange",
  "smaBody",
  "smaShortTerm",
  "smaLongTerm",
  "wpr",
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
  result?.smaRange,
  result?.smaBody,
  result?.smaShortTerm,
  result?.smaLongTerm,
  result?.wpr,
];

export const run: Experiment = async (options, backtest) => {
  // prepare CSV file
  const { symbol, period } = options;
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const stream = format({ headers: csvHeaders });
  const output = fs.createWriteStream(
    `./metrics-${symbol.replace("/", "")}-${
      ProtoOATrendbarPeriod[period]
    }-${oid}.csv`
  );
  stream.pipe(output);

  // run strategy / analysis
  return backtest({
    ...options,
    strategy: (options) => {
      const strategy = metrics(options);
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
