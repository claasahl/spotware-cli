import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";
import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";

import * as R from "./requests";
import * as M from "./macros";
import * as S from "./strategies";
import { Events } from "./events";

const log = debug("custom-client");
const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

const events = new Events();
const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
const event = useTLS ? "secureConnect" : "connect";
const s = new SpotwareClientSocket(socket);
socket.once(event, async () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  try {
    const traders = await M.authenticate(s, {
      clientId: process.env.clientId || "",
      clientSecret: process.env.clientSecret || "",
      accessToken: process.env.accessToken || "",
      refreshToken: process.env.refreshToken || "",
    });
    await M.emitAccounts({ events, traders });
    await M.detectBrokenOrders(s);
    M.exitOnDisconnect(s);
  } catch (err) {
    log("%j", err);
    process.exit(1);
  }
});

events.on("account", async (account) => {
  if (!account.authenticated || !account.depositAssetId) {
    return;
  }
  const { ctidTraderAccountId } = account;
  const result = await M.symbols(s, { ctidTraderAccountId });
  const symbols = result.symbols.filter(
    (s) =>
      s.baseAssetId === account.depositAssetId ||
      s.quoteAssetId === account.depositAssetId
  );
  await M.emitSymbols({ ...result, symbols, events, ctidTraderAccountId });
});

const ASSET_CLASSES = ["Forex", "Metals", "Crypto Currency"];
events.on("symbol", async (symbol) => {
  if (!ASSET_CLASSES.includes(symbol.assetClass)) {
    return;
  }
  log("%j", symbol);
  if (symbol.symbolName !== "BTC/EUR") {
    return;
  }
  const period = ProtoOATrendbarPeriod.H1;
  const loadThisMuchHistoricalData = "0d";
  s.on(
    "data",
    await S.highLow({
      socket: s,
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      symbolId: symbol.symbolId,
      period,
      stopLossOffset: 1,
      volumeInLots: 0.1,
    })
    // await S.insideBarMomentum({
    //   socket: s,
    //   ctidTraderAccountId: symbol.ctidTraderAccountId,
    //   symbolId: symbol.symbolId,
    //   period,
    //   expirationOffset: ms("6h"),
    //   riskInEur: 20,
    //   convert: symbol.symbolName.endsWith("EUR"),
    // })
  );
  await M.trendbars(s, {
    ctidTraderAccountId: symbol.ctidTraderAccountId,
    loadThisMuchHistoricalData,
    symbolId: symbol.symbolId,
    period,
  });
});

// rule of thumb:
// - we want all custom events to be emitted on the same stream (i.e. global ordering / no stream merging)
// - keep prices in integer format for as long as possible, otherwise one will most likely accumulate rounding errors over time
// - only produce outputs for SMA (and similar) when enough data has been buffered (i.e. all required candles / trendbars)
// - stick original spotware messages and use utility functions to convert and accumulate high-level information
