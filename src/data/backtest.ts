import {
  Messages,
  ProtoOALightSymbol,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
  SpotwareSocket,
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
  strategy: (options: StrategyOptions) => (message: Messages) => void;
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

      // "feed" trendbars to strategy
      await download(socket, {
        ctidTraderAccountId,
        symbolId: symbol.symbolId,
        period: options.period,
        fromDate: options.fromDate,
        toDate: options.toDate,
        cb: strategy,
      });
    }
  }
  log("done");
  socket.end();
  options.done();
}
