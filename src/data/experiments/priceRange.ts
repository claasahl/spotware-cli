import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import { createWriteStream } from "fs";

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
  SMAHigh?: number;
  SMALow?: number;
}
export function priceRange(options: Options) {
  const { ctidTraderAccountId, symbolId, period, smaPeriods = 200 } = options;
  const smaHigh = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: smaPeriods,
    property: "high",
  });
  const smaLow = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: smaPeriods,
    property: "low",
  });
  return (_timestamp: number, msg: Messages): Result | undefined => {
    const SMAHigh = smaHigh(msg);
    const SMALow = smaLow(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    const data = {
      symbolId,
      SMAHigh,
      SMALow,
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
  "SMALow",
  "SMAHigh",
  "range",
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
  result?.SMALow,
  result?.SMAHigh,
  result?.SMALow && result?.SMAHigh
    ? result.SMAHigh - result.SMALow
    : undefined,
];

export const run: Experiment = (options, backtest) => {
  // prepare CSV file
  const { symbol, period } = options;
  const stream = format({ headers: csvHeaders });
  const output = createWriteStream(
    `./price-range-${symbol.replace("/", "")}-${
      ProtoOATrendbarPeriod[period]
    }.csv`
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
