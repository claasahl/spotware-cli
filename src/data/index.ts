import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import ms from "ms";

import { backtest, Options as BacktestOptions } from "./backtest";
import * as E from "./experiments";

const symbol = "EURGBP";
const period = ProtoOATrendbarPeriod.H1;
const fromDate = new Date("2019-11-01T00:00:00.000Z");
const toDate = new Date("2020-11-01T00:00:00.000Z");

const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

const bt = (options: Pick<BacktestOptions, "strategy" | "done">) =>
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
    symbol,
    period,
    forsight: ms("12h"),
  });

// E.insideBarMomentum({ symbol, period }, bt);
E.priceRange({ symbol, period }, bt);
