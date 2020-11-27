import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import git from "isomorphic-git";
import fs from "fs";
import debug from "debug";

import * as utils from "../../utils";
import * as R from "../requests";
import ms from "ms";

const log = debug("spotware").extend("strategies").extend("high-low");

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  stopLossOffset: number;
  volumeInLots: number;
  threshold: number;
  expirationOffset: number;
}
export default async function strategy(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    stopLossOffset,
    volumeInLots,
    threshold,
    expirationOffset,
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
  const { lotSize = 1, digits } = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const bla = {
    crossedThreshold: false,
  };
  return (msg: Messages) => {
    const hl = HighLow(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    if (!hl) {
      return;
    }

    const offset = Date.now() - hl.timestamp;
    const crossedThreshold = offset >= threshold;
    if (!bla.crossedThreshold && crossedThreshold) {
      log("%j", bla);
      const orderType = ProtoOAOrderType.LIMIT;
      const comment = `${ProtoOAOrderType[orderType]}-${oid}`;
      const label = `${ProtoOAOrderType[orderType]}-${oid}`;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType,
        tradeSide: ProtoOATradeSide.SELL,
        volume: volumeInLots * lotSize,
        limitPrice: utils.price(hl.low, digits),
        stopLoss: utils.price(hl.low + stopLossOffset * 100000, digits),
        trailingStopLoss: true,
        comment,
        label,
        expirationTimestamp: Date.now() + expirationOffset,
      });
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType,
        tradeSide: ProtoOATradeSide.BUY,
        volume: volumeInLots * lotSize,
        limitPrice: utils.price(hl.high, digits),
        stopLoss: utils.price(hl.high - stopLossOffset * 100000, digits),
        trailingStopLoss: true,
        comment,
        label,
        expirationTimestamp: Date.now() + expirationOffset,
      });
    }
    bla.crossedThreshold = crossedThreshold;
    log("%j", { offset, offsetHuma: ms(offset), hl, ...bla });
  };
}
