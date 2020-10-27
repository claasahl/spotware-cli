import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import { createWriteStream } from "fs";

import { backtest } from "./backtest";
import { insideBarMomentum } from "./insideBarMomentum";
import { toLiveTrendbar } from "./utils";

const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";
const stream = format();
const output = createWriteStream("./data.csv");
stream.pipe(output);

backtest({
  connection: {
    port,
    host,
    useTLS,
  },
  authentication: {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  },
  fromDate: new Date("2020-01-01T00:00:00.000Z"),
  toDate: new Date("2020-10-25T00:00:00.000Z"),
  symbol: "EURUSD",
  period: ProtoOATrendbarPeriod.H1,
  strategy: (options) => {
    const strategy = insideBarMomentum(options);
    return (trendbar) => {
      const message = toLiveTrendbar(options, trendbar);
      const result = strategy(message);
      stream.write([
        trendbar.volume,
        trendbar.open,
        trendbar.high,
        trendbar.low,
        trendbar.close,
        trendbar.period,
        trendbar.timestamp,
        new Date(trendbar.timestamp).toISOString(),
        result?.price,
        result?.SMA50,
        result?.SMA200,
        result?.WPR,
        result?.bearish,
        result?.bullish,
        result?.ISM?.enter,
        result?.ISM?.stopLoss,
        result?.ISM?.takeProfit,
        result?.ISM?.tradeSide,
      ]);
    };
  },
  done: () => stream.end(),
});
