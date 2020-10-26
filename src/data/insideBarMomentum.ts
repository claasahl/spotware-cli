import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import * as utils from "../utils";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  shortTermSmaPeriods?: number;
  longTermSmaPeriods?: number;
  williamsPercentRangePeriods?: number;
}
export async function insideBarMomentum(options: Options) {
  const enterOffset = 0.1;
  const stopLossOffset = 0.4;
  const takeProfitOffset = 0.8;
  const {
    ctidTraderAccountId,
    symbolId,
    period,
    shortTermSmaPeriods = 50,
    longTermSmaPeriods = 200,
    williamsPercentRangePeriods = 30,
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
    if (!SMA50 || !SMA200 || !WPR || !ISM || !bid) {
      return;
    }
    const bullish = bid > SMA50 && bid > SMA200 && SMA50 > SMA200 && WPR >= -20;
    const bearish = bid < SMA50 && bid < SMA200 && SMA50 < SMA200 && WPR <= -80;
    return {
      symbolId,
      price: bid,
      SMA50,
      SMA200,
      bullish,
      bearish,
      WPR,
      topRange: WPR >= -20,
      bottomRange: WPR <= -80,
      ISM,
    };
  };
}
