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
const fromDate = new Date("2019-11-01T00:00:00.000Z");
const toDate = new Date("2020-11-01T00:00:00.000Z");

// E.insideBarMomentum({ symbol, period: ProtoOATrendbarPeriod.M5, forsight: ms("12h") }, bt);
// E.priceRange({ symbol, period: ProtoOATrendbarPeriod.M5, forsight: ms("12h") }, bt);
E.highLow(
  { symbol, period: ProtoOATrendbarPeriod.D1, forsight: ms("24h") },
  bt
);
