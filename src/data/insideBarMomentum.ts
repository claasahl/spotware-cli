import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import * as utils from "../utils";
import { Trendbar } from "../utils";
import { Order } from "./orders";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  shortTermSmaPeriods?: number;
  longTermSmaPeriods?: number;
  williamsPercentRangePeriods?: number;
}

interface Result {
  symbolId: number;
  price?: number;
  SMA50?: number;
  SMA200?: number;
  WPR?: number;
  ISM?: {
    enter: number;
    stopLoss: number;
    takeProfit: number;
    tradeSide: ProtoOATradeSide;
  };
  bullish?: boolean;
  bearish?: boolean;
  pl?: number;
}
export function insideBarMomentum(options: Options) {
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
  return (
    msg: Messages,
    order: (order: Order) => number | undefined
  ): Result | undefined => {
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

    const pl = ISM ? order(ISM) : undefined;
    const bid = msg.payload.bid;
    const data = {
      symbolId,
      price: bid,
      SMA50,
      SMA200,
      WPR,
      ISM,
      bullish: undefined,
      bearish: undefined,
      pl,
    };
    if (!SMA50 || !SMA200 || !WPR || !ISM || !bid) {
      return data;
    }
    const bullish = bid > SMA50 && bid > SMA200 && SMA50 > SMA200 && WPR >= -20;
    const bearish = bid < SMA50 && bid < SMA200 && SMA50 < SMA200 && WPR <= -80;
    return { ...data, bullish, bearish };
  };
}

export const csvHeaders = [
  "volume",
  "open",
  "high",
  "low",
  "close",
  "period",
  "timestamp",
  "date",
  "price",
  "SMA50",
  "SMA200",
  "WPR",
  "bearish",
  "bullish",
  "patternMatched",
  "enter",
  "stopLoss",
  "takeProfit",
  "tradeSide",
  "profitLoss",
];

export const csvData = (trendbar: Trendbar, result?: Result) => [
  trendbar.volume,
  trendbar.open,
  trendbar.high,
  trendbar.low,
  trendbar.close,
  trendbar.period,
  trendbar.timestamp,
  new Date(trendbar.timestamp).toISOString(),
  result?.price,
  result?.SMA50,
  result?.SMA200,
  result?.WPR,
  result?.bearish,
  result?.bullish,
  !!result?.ISM,
  result?.ISM?.enter,
  result?.ISM?.stopLoss,
  result?.ISM?.takeProfit,
  result?.ISM?.tradeSide,
  result?.pl,
];
