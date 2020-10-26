import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import { backtest } from "./backtest";
import { insideBarMomentum } from "./insideBarMomentum";

const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

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
  strategy: insideBarMomentum,
});
