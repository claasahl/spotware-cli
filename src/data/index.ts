import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";
import fs from "fs";
import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as M from "../client/macros";
import * as R from "../client/requests";

const log = debug("custom-client");
const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
const event = useTLS ? "secureConnect" : "connect";
const s = new SpotwareClientSocket(socket);
socket.once(event, () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  const traders = await M.authenticate(s, {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
  log("%j", traders);
  for (const trader of traders) {
    const symbols = await R.PROTO_OA_SYMBOLS_LIST_REQ(s, {
      ctidTraderAccountId: trader.ctidTraderAccountId,
    });
    const EURUSD = symbols.symbol.filter((s) => s.symbolName === "EURUSD")[0];
    const trendbars = await R.PROTO_OA_GET_TRENDBARS_REQ(s, {
      ctidTraderAccountId: trader.ctidTraderAccountId,
      period: ProtoOATrendbarPeriod.D1,
      symbolId: EURUSD.symbolId,
      fromTimestamp: new Date("2020-01-01T00:00:00.000Z").getTime(),
      toTimestamp: new Date("2020-10-25T00:00:00.000Z").getTime(),
    });
    await fs.promises.writeFile(
      "trendbars.json",
      JSON.stringify(trendbars, null, 2)
    );
  }
});
