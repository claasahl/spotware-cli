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

import * as utils from "../../utils";
import * as R from "../requests";
import ms from "ms";

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
  stopLossOffset: number;
  volumeInLots: number;
}
export default async function strategy(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    periods,
    stopLossOffset,
    volumeInLots,
  } = options;
  const HighLow = utils.highLow({
    ctidTraderAccountId,
    symbolId,
    period,
    periods,
  });
  const details = await R.PROTO_OA_SYMBOL_BY_ID_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  const { lotSize = 1 } = details.symbol[0];
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

    if (!hl) {
      return;
    }

    const expirationOffset = ms("12h");
    if (hl.lows.length > 0) {
      const stopPrice = hl.lows[0].low;
      const stopLoss = stopPrice + stopLossOffset;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.STOP,
        tradeSide: ProtoOATradeSide.SELL,
        volume: lotSize * volumeInLots,
        stopPrice,
        stopLoss,
        trailingStopLoss: true,
        expirationTimestamp: Date.now() + expirationOffset,
        comment: oid,
        label: oid,
      });
    }
    if (hl.highs.length > 0) {
      const stopPrice = hl.highs[0].high;
      const stopLoss = stopPrice - stopLossOffset;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.STOP,
        tradeSide: ProtoOATradeSide.BUY,
        volume: lotSize * volumeInLots,
        stopPrice,
        stopLoss,
        trailingStopLoss: true,
        expirationTimestamp: Date.now() + expirationOffset,
        comment: oid,
        label: oid,
      });
    }

    if (hl.lows.length > 0 && hl.highs.length > 0) {
      const limitPrice = hl.lows[0].low;
      const takeProfit = hl.highs[0].high - stopLossOffset;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.LIMIT,
        tradeSide: ProtoOATradeSide.BUY,
        volume: lotSize * volumeInLots,
        limitPrice,
        takeProfit,
        expirationTimestamp: Date.now() + expirationOffset,
        comment: oid,
        label: oid,
      });
    }
    if (hl.lows.length > 0 && hl.highs.length > 0) {
      const limitPrice = hl.highs[0].high;
      const takeProfit = hl.lows[0].low + stopLossOffset;
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.LIMIT,
        tradeSide: ProtoOATradeSide.SELL,
        volume: lotSize * volumeInLots,
        limitPrice,
        takeProfit,
        expirationTimestamp: Date.now() + expirationOffset,
        comment: oid,
        label: oid,
      });
    }
  };
}
