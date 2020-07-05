import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

const config = {
  host: process.env.host || "configure env. variable 'host'",
  port: Number(process.env.port || "5035"),
  clientId: process.env.clientId || "configure env. variable 'clientId'",
  clientSecret: process.env.clientSecret || "configure env. variable 'clientSecret'",
  accessToken: process.env.accessToken || "configure env. variable 'accessToken'",
  refreshToken: process.env.refreshToken || "configure env. variable 'refreshToken'",
  symbol: process.env.symbol || "configure env. variable 'symbol'",
  volume: Number(process.env.volume || "configure env. variable 'volume'"),
  period:
    ProtoOATrendbarPeriod[
      (process.env.period ||
        "configure env. variable 'period'") as keyof typeof ProtoOATrendbarPeriod
    ],
  expirationOffset: Number(
    process.env.expirationOffset || "configure env. variable 'expirationOffset'"
  ),
  enterOffset: Number(
    process.env.enterOffset || "configure env. variable 'enterOffset'"
  ),
  stopLossOffset: Number(
    process.env.stopLossOffset || "configure env. variable 'stopLossOffset'"
  ),
  takeProfitOffset: Number(
    process.env.takeProfitOffset || "configure env. variable 'takeProfitOffset'"
  ),
  minTrendbarRange: Number(
    process.env.minTrendbarRange ||
      "configure env. variable 'minTrendbarRange'"
  ),
};
export default config;
