import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import ms from "ms";

import { backtest } from "./backtest";
import * as R from "./runner";
import * as E from "./experiments";
import { SymbolData } from "./runner/types";

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
// E.recurringPriceLevels(
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

const classes = ["Forex", "Crypto Currency"];
function accountCurrencies(data: SymbolData): boolean {
  if (!classes.includes(data.assetClass.name || "")) {
    return false;
  }
  if (!data.symbol.symbolName?.includes(data.depositAsset.name)) {
    return false;
  }
  return true;
}

function currencies(...names: string[]): (data: SymbolData) => boolean {
  return (data) => names.includes(data.symbol.symbolName || "");
}

R.main({
  // process: R.highLow({
  //   processSymbol: currencies("EURGBP"),
  //   fromDate: new Date("2019-12-01T00:00:00.000Z"),
  //   toDate: new Date("2020-12-01T00:00:00.000Z"),
  // }),
  process: R.metrics({
    processSymbol: currencies("EURGBP"),
    fromDate: new Date("2020-12-01T00:00:00.000Z"),
    toDate: new Date("2020-12-30T00:00:00.000Z"),
    period: ProtoOATrendbarPeriod.M5,
  }),
  // process: R.deals({
  //   processSymbol: currencies("EURGBP"),
  //   fromDate: new Date("2020-12-01T00:00:00.000Z"),
  //   toDate: new Date("2020-12-30T00:00:00.000Z"),
  // }),
});
