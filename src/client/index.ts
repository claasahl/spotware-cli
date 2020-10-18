import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "./requests";
import * as M from "./macros";
import * as S from "./strategies";
import { Events } from "./events";

const host = process.env.SPOTWARE__HOST || "live.ctraderapi.com";
const port = Number(process.env.SPOTWARE__PORT) || 5035;

const events = new Events();
const isLocalhost = host === "localhost";
const socket = isLocalhost ? netConnect(port, host) : tlsConnect(port, host);
const event = isLocalhost ? "connect" : "secureConnect";
const s = new SpotwareClientSocket(socket);
socket.once(event, async () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  const config = await M.refreshToken(s, {
    clientId: process.env.SPOTWARE__CLIENT_ID || "",
    clientSecret: process.env.SPOTWARE__CLIENT_SECRET || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
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
    await M.trendbars(s, {
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      loadThisMuchHistoricalData: "4h",
      symbolId: symbol.symbolId,
      period: ProtoOATrendbarPeriod.M1,
    });
    s.on(
      "data",
      S.insideBarMomentum({
        socket: s,
        ctidTraderAccountId: symbol.ctidTraderAccountId,
        symbolId: symbol.symbolId,
        period: ProtoOATrendbarPeriod.M1,
      })
    );
  }
});

events.on("spot", (spot) => {
  console.log(spot);
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
