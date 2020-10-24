import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";
import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "./requests";
import * as M from "./macros";
import * as S from "./strategies";
import { Events } from "./events";

const log = debug("custom-client");
const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;

const events = new Events();
const useTLS = Boolean(process.env.useTLS);
const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
const event = useTLS ? "secureConnect" : "connect";
const s = new SpotwareClientSocket(socket);
socket.once(event, async () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  const traders = await M.authenticate(s, {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
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
  log("%j", symbol);
  // if (symbol.symbolName !== "BTC/EUR") {
  //   return;
  // }
  const period = ProtoOATrendbarPeriod.H1;
  const loadThisMuchHistoricalData = "15d";
  s.on(
    "data",
    await S.insideBarMomentum({
      socket: s,
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      symbolId: symbol.symbolId,
      period,
    })
  );
  await M.trendbars(s, {
    ctidTraderAccountId: symbol.ctidTraderAccountId,
    loadThisMuchHistoricalData,
    symbolId: symbol.symbolId,
    period,
  });
});

// "break out" separate stream that focuses on (highlevel) application (ideally both read and write)
// "break out" separate streams that focus on individual accounts (ideally both read and write)
// "break out" separate streams that focus on spot prices for a symbol (ideally both read and write)

// was not able to use Duplex streams for spot prices stream.
// -- calls to socket.read() would "eat" data away from other consumers
// -- only flowing mode would be doable, but then backpressure would not be supported (other than forcefully pausing the stream -- which might be exactlz how nodejs implements it)

// -----

// prepare list of relevant messages for each of the above streams
// ... alternatively, consider wrapping spotware stream in another Duplex stream which transforms spotware events into a more digestable format
// ... or a Transform stream which transforms live trendbars into sensible trendbars

// rule of thumb:
// - we want all custom events to be emitted on the same stream (i.e. global ordering / no stream merging)
// - keep prices in integer format for as long as possible, otherwise one will most likely accumulate rounding errors over time
// - only produce outputs for SMA (and similar) when enough data has been buffered (i.e. all required candles / trendbars)
