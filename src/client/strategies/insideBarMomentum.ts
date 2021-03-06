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

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  enterOffset?: number;
  stopLossOffset?: number;
  takeProfitOffset?: number;
  expirationOffset?: number;
  riskInEur?: number;
  convert?: boolean;
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
    riskInEur = 20,
    convert,
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

    const stopPrice = utils.price(ISM.enter, digits);
    const stopLoss = utils.price(ISM.stopLoss, digits);
    const takeProfit = utils.price(ISM.takeProfit, digits);
    R.PROTO_OA_NEW_ORDER_REQ(socket, {
      ctidTraderAccountId,
      symbolId,
      orderType: ProtoOAOrderType.STOP,
      tradeSide: ISM.tradeSide,
      volume: utils.volume(stopPrice, stopLoss, riskInEur, stepVolume, convert),
      stopPrice,
      stopLoss,
      takeProfit,
      expirationTimestamp: expirationOffset
        ? Date.now() + expirationOffset
        : undefined,
      comment: oid,
      label: oid,
    });
  };
}
