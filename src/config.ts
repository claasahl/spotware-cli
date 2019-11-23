const config = {
  host: process.env.host || "configure env. variable 'host'",
  port: Number(process.env.port || "5035"),
  clientId: process.env.clientId || "configure env. variable 'clientId'",
  clientSecret:
    process.env.clientSecret || "configure env. variable 'clientSecret'",
  accessToken:
    process.env.accessToken || "configure env. variable 'accessToken'",
  refreshToken:
    process.env.refreshToken || "configure env. variable 'refreshToken'",
  ctidTraderAccountId: Number(
    process.env.ctidTraderAccountId ||
      "configure env. variable 'ctidTraderAccountId'"
  )
};
export default config;
