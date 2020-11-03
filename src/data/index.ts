import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { format } from "@fast-csv/format";
import { createWriteStream } from "fs";
import ms from "ms";

import { backtest } from "./backtest";
import { insideBarMomentum, csvHeaders, csvData } from "./insideBarMomentum";
import { toLiveTrendbar } from "./utils";
import { Order, forsight } from "./orders";

const symbol = "BTC/USD";
const period = ProtoOATrendbarPeriod.H1;
const fromDate = new Date("2020-01-01T00:00:00.000Z");
const toDate = new Date("2020-10-25T00:00:00.000Z");

const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";
const stream = format({ headers: csvHeaders });
const output = createWriteStream(
  `./data-${symbol.replace("/", "")}-${ProtoOATrendbarPeriod[period]}.csv`
);
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
  fromDate,
  toDate,
  symbol,
  period,
  forsight: ms("12h"),
  strategy: (options) => {
    const strategy = insideBarMomentum(options);
    return (trendbar, future) => {
      const order = (o: Order): number | undefined => forsight(future, o);
      const message = toLiveTrendbar(options, trendbar);
      const result = strategy(trendbar.timestamp, message, order);
      stream.write(csvData(trendbar, result));
    };
  },
  done: () => stream.end(),
});
