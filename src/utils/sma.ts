import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  PROTO_OA_GET_TRENDBARS_RES,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";

import { period } from "./period";
import { Trendbar, trendbars } from "./trendbar";

interface SmaOptions {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export function sma(options: SmaOptions) {
  const data: Trendbar[] = [];
  let sum = 0;
  function value() {
    if (data.length > 0 && data.length <= options.periods) {
      return Math.round(sum / data.length);
    }
    return 0;
  }
  function proto_oa_get_trendbars_res(msg: PROTO_OA_GET_TRENDBARS_RES): number {
    if (msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId) {
      return value();
    } else if (msg.payload.symbolId !== options.symbolId) {
      return value();
    } else if (msg.payload.period !== options.period) {
      return value();
    }

    const reference =
      Date.now() - (options.periods + 1) * period(options.period);
    const bars = trendbars(msg).filter((bar) => bar.timestamp >= reference);
    const tmp = [...bars, ...data].sort((a, b) => a.timestamp - b.timestamp);
    if (tmp.length > options.periods) {
      tmp.splice(0, tmp.length - options.periods);
    }

    data.splice(0);
    data.push(...tmp);
    sum = tmp.reduce((prev, curr) => prev + curr.close, 0);
    return value();
  }
  function proto_oa_spot_event(msg: PROTO_OA_SPOT_EVENT): number {
    if (msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId) {
      return value();
    } else if (msg.payload.symbolId !== options.symbolId) {
      return value();
    }

    const bars = trendbars(msg).filter((bar) => bar.period === options.period);

    if (bars.length === 0) {
      return value();
    } else if (bars.length !== 1) {
      throw new Error(
        "what is gooooing ooon? more trendars with the same period?"
      );
    }

    if (
      data.length > 0 &&
      data[data.length - 1].timestamp === bars[0].timestamp
    ) {
      sum -= data[data.length - 1].close;
      data.pop();
    }
    data.push(bars[0]);
    sum += bars[0].close;

    while (data.length > options.periods) {
      sum -= data[0].close;
      data.shift();
    }
    return value();
  }
  return (msg: Messages): number => {
    switch (msg.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES:
        return proto_oa_get_trendbars_res(msg);
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        return proto_oa_spot_event(msg);
      default:
        return value();
    }
  };
}
