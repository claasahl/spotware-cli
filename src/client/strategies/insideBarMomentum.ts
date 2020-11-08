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
  shortTermSmaPeriods?: number;
  longTermSmaPeriods?: number;
  williamsPercentRangePeriods?: number;
  enterOffset?: number;
  stopLossOffset?: number;
  takeProfitOffset?: number;
  expirationOffset?: number;
  tradeVolumeInLots?: number;
}
export default async function insideBarMomentum(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    shortTermSmaPeriods = 50,
    longTermSmaPeriods = 200,
    williamsPercentRangePeriods = 30,
    enterOffset = 0.1,
    stopLossOffset = 0.4,
    takeProfitOffset = 0.8,
    expirationOffset,
    tradeVolumeInLots = 0.1,
  } = options;
  const sma50 = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: shortTermSmaPeriods,
  });
  const sma200 = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: longTermSmaPeriods,
  });
  const wpr = utils.WilliamsPercentRange({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: williamsPercentRangePeriods,
  });
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
  const { digits, lotSize = 1 } = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  return (msg: Messages) => {
    const SMA50 = sma50(msg);
    const SMA200 = sma200(msg);
    const WPR = wpr(msg);
    const ISM = ism(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    const bid = msg.payload.bid;
    log("%j", { symbolId, SMA50, SMA200, WPR, ISM, price: bid });
    if (!SMA50 || !SMA200 || !WPR || !ISM || !bid) {
      return;
    }
    const bullish = bid > SMA50 && bid > SMA200 && SMA50 > SMA200 && WPR >= -20;
    const bearish = bid < SMA50 && bid < SMA200 && SMA50 < SMA200 && WPR <= -80;
    log("%j", {
      symbolId,
      bullish,
      bearish,
      priceOverSMA50: bid > SMA50,
      priceOverSMA200: bid > SMA200,
      SMA50OverSMA200: SMA50 > SMA200,
      topRange: WPR >= -20,
      bottomRange: WPR <= -80,
      price: bid,
      SMA50,
      SMA200,
      WPR,
      ISM,
    });
    if (bullish || bearish) {
      R.PROTO_OA_NEW_ORDER_REQ(socket, {
        ctidTraderAccountId,
        symbolId,
        orderType: ProtoOAOrderType.STOP,
        tradeSide: ISM.tradeSide,
        volume: tradeVolumeInLots * lotSize,
        stopPrice: utils.price(ISM.enter, digits),
        stopLoss: utils.price(ISM.stopLoss, digits),
        takeProfit: utils.price(ISM.takeProfit, digits),
        expirationTimestamp: expirationOffset
          ? Date.now() + expirationOffset
          : undefined,
        comment: oid,
        label: oid,
      });
    }
  };
}
