import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import debug from "debug";
import git from "isomorphic-git";
import fs from "fs";

import * as utils from "../../utils";
import * as R from "../requests";
import ms from "ms";

const log = debug("high-low");

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  stopLossOffset: number;
  riskInEur?: number;
  convert?: boolean;
}
export default async function strategy(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    stopLossOffset,
    riskInEur = 20,
    convert,
  } = options;
  const HighLow = utils.highLow({
    ctidTraderAccountId,
    symbolId,
    period,
  });
  const details = await R.PROTO_OA_SYMBOL_BY_ID_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  const { stepVolume = 100000 } = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  return (msg: Messages) => {
    const hl = HighLow(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    // new D1 bar?
    // new M5 bar?
    // crossed 11am threshold?

    if (hl && hl.msSinceLastReset === 0 && hl.lows.length > 0) {
      const expirationOffset = hl.msUntilNextReset - ms("1min");
      const stopPrice = hl.lows[0].low;
      const stopLoss = stopPrice - stopLossOffset;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.STOP,
        tradeSide: ProtoOATradeSide.SELL,
        volume: utils.volume(
          stopPrice,
          stopLoss,
          riskInEur,
          stepVolume,
          convert
        ),
        stopPrice,
        stopLoss,
        trailingStopLoss: true,
        expirationTimestamp: Date.now() + expirationOffset,
        comment: oid,
        label: oid,
      });
    }
  };
}
