import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import debug from "debug";
import git from "isomorphic-git";
import fs from "fs";

import * as utils from "../../utils";
import * as R from "../requests";

const log = debug("inside-bar-momentum");

function volume(price1: number, price2: number, risk: number, step = 1000) {
  const entry = Math.max(price1, price2);
  const close = Math.min(price1, price2);
  const volume = (risk * close) / (entry - close);
  return Math.round(volume / step) * step;
}

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  enterOffset?: number;
  stopLossOffset?: number;
  takeProfitOffset?: number;
  expirationOffset?: number;
}
export default async function insideBarMomentum(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    enterOffset = 0.1,
    stopLossOffset = 0.4,
    takeProfitOffset = 0.8,
    expirationOffset,
  } = options;
  const ism = utils.insideBarMomentum({
    ctidTraderAccountId,
    symbolId,
    period,
    enterOffset,
    stopLossOffset,
    takeProfitOffset,
  });
  const details = await R.PROTO_OA_SYMBOL_BY_ID_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  const { digits, stepVolume = 100000 } = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  return (msg: Messages) => {
    const ISM = ism(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    const bid = msg.payload.bid;
    log("%j", { symbolId, ISM, price: bid });
    if (!ISM || !bid) {
      return;
    }
    R.PROTO_OA_NEW_ORDER_REQ(socket, {
      ctidTraderAccountId,
      symbolId,
      orderType: ProtoOAOrderType.STOP,
      tradeSide: ISM.tradeSide,
      volume: volume(ISM.enter, ISM.stopLoss, 20, stepVolume / 100),
      stopPrice: utils.price(ISM.enter, digits),
      stopLoss: utils.price(ISM.stopLoss, digits),
      takeProfit: utils.price(ISM.takeProfit, digits),
      expirationTimestamp: expirationOffset
        ? Date.now() + expirationOffset
        : undefined,
      comment: oid,
      label: oid,
    });
  };
}
