import { Transform, TransformCallback } from "stream";
import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  PROTO_OA_SPOT_EVENT,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";

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

// we want all custom events to be emitted on the same stream (i.e. global ordering / no stream merging)

class JustDoIt extends Transform {
  // types are missing
  private FACTOR = Math.pow(10, 5);
  constructor() {
    super({ allowHalfOpen: false, autoDestroy: true, objectMode: true });
  }

  _transform(
    chunk: Messages,
    _encoding: string,
    callback: TransformCallback
  ): void {
    this.push(chunk); // TODO add backpressure support
    switch (chunk.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        {
          const { bid, trendbar } = chunk.payload;
          if (bid) {
            trendbar
              .filter(
                (bar): bar is Required<ProtoOATrendbar> =>
                  typeof bar.deltaHigh === "number" &&
                  typeof bar.deltaOpen === "number" &&
                  typeof bar.low === "number" &&
                  typeof bar.period === "number" &&
                  typeof bar.utcTimestampInMinutes === "number"
              )
              .map((bar) => ({
                payloadType: 11111,
                timestamp: new Date(bar.utcTimestampInMinutes * 60000),
                open: (bar.low + bar.deltaOpen) / this.FACTOR,
                high: (bar.low + bar.deltaHigh) / this.FACTOR,
                low: bar.low / this.FACTOR,
                close: bid / this.FACTOR,
                volume: bar.volume,
              }))
              .forEach((b) => this.push(b)); // TODO add backpressure support
          }
        }
        break;
    }
    callback();
  }
}
// const a = s.pipe(new JustDoIt());
// a.on("data", (msg) => {
//   switch (msg.payloadType) {
//     case 11111:
//       console.log("----------", msg);
//       break;
//   }
// });

s.on("data", (msg) => {
  switch (msg.payloadType) {
    case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
      console.log(sma(msg));
      break;
  }
});

namespace utils {
  export interface Trendbar {
    timestamp: number;
    period: ProtoOATrendbarPeriod;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  const FACTOR = Math.pow(10, 5);

  export function trendbars(message: PROTO_OA_SPOT_EVENT): Trendbar[] {
    const bid = message.payload.bid;
    if (!bid) {
      return [];
    }

    return message.payload.trendbar
      .filter(
        (bar): bar is Required<ProtoOATrendbar> =>
          typeof bar.deltaHigh === "number" &&
          typeof bar.deltaOpen === "number" &&
          typeof bar.low === "number" &&
          typeof bar.period === "number" &&
          typeof bar.utcTimestampInMinutes === "number"
      )
      .map((bar) => ({
        timestamp: bar.utcTimestampInMinutes * 60000,
        period: bar.period,
        open: bar.low + bar.deltaOpen,
        high: bar.low + bar.deltaHigh,
        low: bar.low,
        close: bid,
        volume: bar.volume,
      }));
  }

  export function period(period: ProtoOATrendbarPeriod): number {
    switch (period) {
      case ProtoOATrendbarPeriod.M1:
        return ms("1m");
      case ProtoOATrendbarPeriod.M2:
        return ms("2m");
      case ProtoOATrendbarPeriod.M3:
        return ms("3m");
      case ProtoOATrendbarPeriod.M4:
        return ms("4m");
      case ProtoOATrendbarPeriod.M5:
        return ms("5m");
      case ProtoOATrendbarPeriod.M10:
        return ms("10m");
      case ProtoOATrendbarPeriod.M15:
        return ms("15m");
      case ProtoOATrendbarPeriod.M30:
        return ms("30m");
      case ProtoOATrendbarPeriod.H1:
        return ms("1h");
      case ProtoOATrendbarPeriod.H4:
        return ms("4h");
      case ProtoOATrendbarPeriod.H12:
        return ms("12h");
      case ProtoOATrendbarPeriod.D1:
        return ms("1d");
      case ProtoOATrendbarPeriod.W1:
        return ms("1w");
      case ProtoOATrendbarPeriod.MN1:
        throw new Error("cannot convert 1MN to millis");
    }
  }

  interface SmaOptions {
    ctidTraderAccountId: number;
    symbolId: number;
    period: ProtoOATrendbarPeriod;
    periods: number;
  }
  export function sma(options: SmaOptions) {
    const trendbars: Trendbar[] = [];
    let sum = 0;
    function value() {
      if (trendbars.length > 0 && trendbars.length <= options.periods) {
        return Math.round(sum / trendbars.length);
      }
      return 0;
    }
    return (msg: PROTO_OA_SPOT_EVENT): number => {
      if (msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId) {
        return value();
      } else if (msg.payload.symbolId !== options.symbolId) {
        return value();
      }

      const bars = utils
        .trendbars(msg)
        .filter((bar) => bar.period === options.period);

      if (bars.length === 0) {
        return value();
      } else if (bars.length !== 1) {
        throw new Error(
          "what is gooooing ooon? more trendars with the same period?"
        );
      }

      if (
        trendbars.length > 0 &&
        trendbars[trendbars.length - 1].timestamp === bars[0].timestamp
      ) {
        sum -= trendbars[trendbars.length - 1].close;
        trendbars.pop();
      }
      trendbars.push(bars[0]);
      sum += bars[0].close;

      while (trendbars.length > options.periods) {
        sum -= trendbars[0].close;
        trendbars.shift();
      }
      return value();
    };
  }
}

const sma = utils.sma({
  ctidTraderAccountId: 17403192,
  symbolId: 22396,
  period: ProtoOATrendbarPeriod.M1,
  periods: 2,
});
