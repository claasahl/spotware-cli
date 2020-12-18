import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import ms from "ms";

import { backtest } from "./backtest";
import * as E from "./experiments";

const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

const bt = (options: E.ExperimentBacktestOptions) =>
  backtest({
    ...options,
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
  });

const symbol = "EURGBP";
// const symbol = "BTC/EUR";
const fromDate = new Date("2020-10-01T00:00:00.000Z");
const toDate = new Date("2020-11-01T00:00:00.000Z");

// E.metrics(
//   {
//     symbol,
//     period: ProtoOATrendbarPeriod.H1,
//     forsight: {
//       offset: ms("0h"),
//       period: ProtoOATrendbarPeriod.M1,
//     },
//   },
//   bt
// );
// E.vwap(
//   {
//     symbol,
//     period: ProtoOATrendbarPeriod.M1,
//     forsight: {
//       offset: ms("0h"),
//       period: ProtoOATrendbarPeriod.M1,
//     },
//   },
//   bt
// );
// E.insideBarMomentum(
//   {
//     symbol,
//     period: ProtoOATrendbarPeriod.H1,
//     forsight: {
//       offset: ms("12h"),
//       period: ProtoOATrendbarPeriod.M1,
//     },
//   },
//   bt
// );
// E.priceRange({ symbol, period: ProtoOATrendbarPeriod.M5, forsight: ms("12h") }, bt);
// E.highLow(
//   {
//     symbol,
//     period: ProtoOATrendbarPeriod.D1,
//     forsight: {
//       offset: ms("24h"),
//       period: ProtoOATrendbarPeriod.M5,
//     },
//   },
//   bt
// );
E.recurringPriceLevels(
  {
    symbol,
    period: ProtoOATrendbarPeriod.M1,
    forsight: {
      offset: ms("0h"),
      period: ProtoOATrendbarPeriod.M1,
    },
  },
  bt
);
