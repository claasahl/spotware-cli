import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as utils from "../utils";
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
    // const spots = await M.spots(s, {
    //   ctidTraderAccountId: symbol.ctidTraderAccountId,
    //   loadThisMuchHistoricalData: "3min",
    //   symbolId: symbol.symbolId,
    // });
    // await M.emitSpots({ events, spots });
    await M.trendbars(s, {
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      loadThisMuchHistoricalData: "1m",
      symbolId: symbol.symbolId,
      period: ProtoOATrendbarPeriod.M1,
    });
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

s.on("data", (msg) => {
  switch (msg.payloadType) {
    case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
      const bid = msg.payload.bid;
      if (!bid) {
        return;
      }
      const SMA50 = sma50(msg);
      const SMA200 = sma200(msg);
      console.log({
        priceOverSMA50: bid > SMA50,
        priceOverSMA200: bid > SMA200,
        SMA50OverSMA200: SMA50 > SMA200,
        price: bid,
        SMA50,
        SMA200,
      });
      break;
  }
});

const sma50 = utils.sma({
  ctidTraderAccountId: 17403192,
  symbolId: 22396,
  period: ProtoOATrendbarPeriod.M1,
  periods: 50,
});
const sma200 = utils.sma({
  ctidTraderAccountId: 17403192,
  symbolId: 22396,
  period: ProtoOATrendbarPeriod.M1,
  periods: 200,
});
