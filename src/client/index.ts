import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";

import * as R from "./requests";
import * as M from "./macros";
import { Events } from "./events";

const config = {
  host: process.env.SPOTWARE__HOST || "live.ctraderapi.com",
  port: Number(process.env.SPOTWARE__PORT) || 5035,
  clientId: process.env.SPOTWARE__CLIENT_ID || "",
  clientSecret: process.env.SPOTWARE__CLIENT_SECRET || "",
  accessToken: process.env.access_token || "",
};

const events = new Events();
const isLocalhost = config.host === "localhost";
const socket = isLocalhost
  ? netConnect(config.port, config.host)
  : tlsConnect(config.port, config.host);
const event = isLocalhost ? "connect" : "secureConnect";
const s = new SpotwareClientSocket(socket);
socket.once(event, async () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  const traders = await M.authenticate(s, config);
  await M.emitAccounts({ events, traders });
});

events.on("account", async (account) => {
  if (!account.authenticated || !account.depositAssetId) {
    return;
  }
  const { ctidTraderAccountId } = account;
  const result = await M.symbols(s, { ctidTraderAccountId });
  await M.emitSymbols({ ...result, events, ctidTraderAccountId });
});

const ASSET_CLASSES = ["Forex", "Metals", "Crypto Currency"];
events.on("symbol", async (symbol) => {
  if (!ASSET_CLASSES.includes(symbol.assetClass)) {
    return;
  }
  console.log(symbol.symbolId, symbol.symbolName);
  if (symbol.symbolName === "BTC/EUR") {
    const spots = await M.spots(s, {
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      loadThisMuchHistoricalData: "3min",
      symbolId: symbol.symbolId,
    });
    await M.emitSpots({ events, spots });
  }
});

events.on("spot", (spot) => {
  console.log(spot);
});
