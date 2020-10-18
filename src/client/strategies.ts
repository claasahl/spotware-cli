import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";
import debug from "debug";

import * as utils from "../utils";
import * as R from "./requests";

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
export async function insideBarMomentum(options: Options) {
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
    expirationOffset = ms("1h"),
    tradeVolumeInLots = 0.01,
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
  const digits = details.symbol[0].digits;
  return (msg: Messages) => {
    switch (msg.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES:
        sma50(msg);
        sma200(msg);
        wpr(msg);
        ism(msg);
        break;
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        const bid = msg.payload.bid;
        if (!bid) {
          break;
        }
        const SMA50 = sma50(msg);
        const SMA200 = sma200(msg);
        const WPR = wpr(msg);
        const ISM = ism(msg);
        log("%j", {
          symbolId,
          priceOverSMA50: SMA50 ? bid > SMA50 : undefined,
          priceOverSMA200: SMA200 ? bid > SMA200 : undefined,
          SMA50OverSMA200: SMA50 && SMA200 ? SMA50 > SMA200 : undefined,
          price: bid,
          SMA50,
          SMA200,
          WPR,
          ISM,
        });
        if (!WPR || !ISM || !SMA50 || !SMA200) {
          break;
        }
        const bullish =
          bid > SMA50 && bid > SMA200 && SMA50 > SMA200 && WPR >= -20;
        const bearish =
          bid < SMA50 && bid < SMA200 && SMA50 < SMA200 && WPR <= -80;
        if (bullish || bearish) {
          R.PROTO_OA_NEW_ORDER_REQ(socket, {
            ctidTraderAccountId,
            symbolId,
            orderType: ProtoOAOrderType.STOP,
            tradeSide: ISM.tradeSide,
            volume: tradeVolumeInLots * 100,
            stopPrice: utils.price(ISM.enter, digits),
            stopLoss: utils.price(ISM.stopLoss, digits),
            takeProfit: utils.price(ISM.takeProfit, digits),
            expirationTimestamp: Date.now() + expirationOffset,
          });
        }
        break;
    }
  };
}
