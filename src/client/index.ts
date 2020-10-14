import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import {
  ProtoOAAssetClass,
  ProtoOASymbolCategory,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "./requests";
import * as M from "./macros";
import { Events } from "./events";
import Spots from "./spots";

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
  for (const trader of traders) {
    events.emit("account", {
      ctidTraderAccountId: trader.ctidTraderAccountId,
      authenticated: true,
      depositAssetId: trader.depositAssetId,
    });
  }
});

events.on("account", async (account) => {
  if (!account.authenticated || !account.depositAssetId) {
    return;
  }
  const { ctidTraderAccountId } = account;
  const result = await M.symbols(s, { ctidTraderAccountId });
  const classes = new Map<number, ProtoOAAssetClass>();
  result.classes.forEach((c) => {
    if (c.id) {
      classes.set(c.id, c);
    }
  });
  const categories = new Map<number, ProtoOASymbolCategory>();
  result.categories.forEach((c) => categories.set(c.id, c));
  for (const symbol of result.symbols) {
    if (!symbol.symbolCategoryId) {
      continue;
    }
    const category = categories.get(symbol.symbolCategoryId);
    if (!category?.assetClassId) {
      continue;
    }
    const clazz = classes.get(category.assetClassId);
    if (!clazz?.name) {
      continue;
    }
    events.emit("symbol", {
      ctidTraderAccountId,
      symbolId: symbol.symbolId,
      symbolName: symbol.symbolName || "",
      assetClass: clazz.name,
    });
  }
});

const ASSET_CLASSES = ["Forex", "Metals", "Crypto Currency"];
events.on("symbol", (symbol) => {
  if (!ASSET_CLASSES.includes(symbol.assetClass)) {
    return;
  }
  console.log(symbol.symbolId, symbol.symbolName);
  if (symbol.symbolName === "BTC/EUR") {
    const spots = new Spots(s, symbol, events);
    s.on("data", (msg) => spots.onMessage(msg));
    spots.onInit();
  }
});

events.on("spot", (spot) => {
  console.log(spot);
});
