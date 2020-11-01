import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";

import {
  Options as AuthenticateOptions,
  macro as authenticate,
} from "../client/macros/authenticate";
import { download } from "./trendbars";
import * as R from "../client/requests";
import { Trendbar } from "../utils";

const log = debug("backtest");

interface ConnectOptions {
  port: number;
  host: string;
  useTLS: boolean;
}
function connect({
  port,
  host,
  useTLS,
}: ConnectOptions): Promise<SpotwareClientSocket> {
  return new Promise((resolve) => {
    const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
    const event = useTLS ? "secureConnect" : "connect";
    socket.once(event, () => resolve(new SpotwareClientSocket(socket)));
  });
}

interface StrategyOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
}

export interface Options {
  connection: ConnectOptions;
  authentication: AuthenticateOptions;
  fromDate: Date;
  toDate: Date;
  symbol: string;
  period: ProtoOATrendbarPeriod;
  forsight: number;
  strategy: (
    options: StrategyOptions
  ) => (trendbar: Trendbar, future: Trendbar[]) => void;
  done: () => void;
}

export async function backtest(options: Options) {
  const socket = await connect(options.connection);
  log("connected to %j", options.connection);

  const traders = await authenticate(socket, options.authentication);
  log("authenticated", { noOfTraders: traders.length });

  for (const trader of traders) {
    const { ctidTraderAccountId } = trader;
    const { symbol: symbols } = await R.PROTO_OA_SYMBOLS_LIST_REQ(socket, {
      ctidTraderAccountId,
    });
    for (const symbol of symbols) {
      // skip irrelevant symbols
      if (symbol.symbolName !== options.symbol) {
        continue;
      }

      // setup strategy
      const { symbolId } = symbol;
      log("running strategy for %j", { ctidTraderAccountId, symbolId });
      const strategy = options.strategy({
        ctidTraderAccountId,
        period: options.period,
        symbolId,
      });

      // ...
      const offset = options.forsight;
      const trenbarsM1: Trendbar[] = [];
      await download(socket, {
        ctidTraderAccountId,
        symbolId: symbol.symbolId,
        period: ProtoOATrendbarPeriod.M1,
        fromDate: options.fromDate,
        toDate: new Date(options.toDate.getTime() + offset),
        cb: (bar) => trenbarsM1.push(bar),
      });
      const future = (bar: Trendbar): Trendbar[] => {
        const timestamp = bar.timestamp;
        return trenbarsM1.filter(
          (b) => b.timestamp >= timestamp && b.timestamp <= timestamp + offset
        );
      };

      // ...
      const trenbars: Trendbar[] = [];
      await download(socket, {
        ctidTraderAccountId,
        symbolId: symbol.symbolId,
        period: options.period,
        fromDate: options.fromDate,
        toDate: options.toDate,
        cb: (bar) => trenbars.push(bar),
      });

      // "feed" trendbars to strategy
      for (const bar of trenbars) {
        strategy(bar, future(bar));
      }
    }
  }
  log("done");
  socket.end();
  options.done();
}
