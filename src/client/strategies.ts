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
}
export function insideBarMomentum(options: Options) {
  const { ctidTraderAccountId, symbolId, period } = options;
  const sma50 = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: 50,
  });
  const sma200 = utils.sma({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: 200,
  });
  const wpr = utils.WilliamsPercentRange({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: 30,
  });
  const ism = utils.insideBarMomentum({
    ctidTraderAccountId,
    symbolId,
    period,
    enterOffset: 0.1,
    stopLossOffset: 0.4,
    takeProfitOffset: 0.8,
  });
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
        console.log({
          symbolId,
          priceOverSMA50: bid > SMA50,
          priceOverSMA200: bid > SMA200,
          SMA50OverSMA200: SMA50 > SMA200,
          price: bid,
          SMA50,
          SMA200,
          WPR,
          ISM,
        });
        if (!WPR || !ISM) {
          break;
        }
        const bullish =
          bid > SMA50 && bid > SMA200 && SMA50 > SMA200 && WPR >= -20;
        const bearish =
          bid < SMA50 && bid < SMA200 && SMA50 < SMA200 && WPR <= -80;
        if (bullish || bearish) {
          // place order!
        }
        break;
    }
  };
}
