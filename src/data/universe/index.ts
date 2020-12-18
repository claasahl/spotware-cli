import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";

import {
  Options as AuthenticateOptions,
  macro as authenticate,
} from "../../client/macros/authenticate";
import * as R from "../../client/requests";

const log = debug("universe");

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

export interface Options {
  connection: ConnectOptions;
  authentication: AuthenticateOptions;
  fromDate: Date;
  toDate: Date;
  done: () => void;
}
export async function main() {
  const connection = {
    host: process.env.host || "live.ctraderapi.com",
    port: Number(process.env.port) || 5035,
    useTLS: process.env.useTLS === "true",
  };
  const socket = await connect(connection);
  log("connected to %j", connection);

  const traders = await authenticate(socket, {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
  log("authenticated", { noOfTraders: traders.length });

  for (const trader of traders) {
    const { ctidTraderAccountId } = trader;
    const { symbol: symbols } = await R.PROTO_OA_SYMBOLS_LIST_REQ(socket, {
      ctidTraderAccountId,
    });
    for (const symbol of symbols) {
      log("%j", symbol);
    }
  }
  log("done");
  socket.end();
}
main();
