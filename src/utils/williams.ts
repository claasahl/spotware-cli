import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  PROTO_OA_GET_TRENDBARS_RES,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";
import { period } from "./period";

import { Trendbar, trendbars } from "./trendbar";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
}
export function WilliamsPercentRange(options: Options) {
  const data: Trendbar[] = [];
  function value() {
    if (data.length === 0) {
      return undefined;
    }
    let high = Number.MIN_SAFE_INTEGER;
    let low = Number.MAX_SAFE_INTEGER;
    for (const bar of data) {
      high = Math.max(bar.high, high);
      low = Math.min(bar.low, low);
    }
    const current = data[data.length - 1].close;
    return ((high - current) / (high - low)) * -100;
  }
  function proto_oa_get_trendbars_res(msg: PROTO_OA_GET_TRENDBARS_RES) {
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
    return value();
  }
  function proto_oa_spot_event(msg: PROTO_OA_SPOT_EVENT) {
    if (msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId) {
      return value();
    } else if (msg.payload.symbolId !== options.symbolId) {
      return value();
    }

    const bars = trendbars(msg).filter((bar) => bar.period === options.period);
    if (bars.length === 0) {
      return value();
    } else if (bars.length !== 1) {
      throw new Error("how could I have not seen this coming?");
    }

    if (
      data.length > 0 &&
      data[data.length - 1].timestamp === bars[0].timestamp
    ) {
      data.pop();
    }
    data.push(bars[0]);

    while (data.length > options.periods) {
      data.shift();
    }
    return value();
  }
  return (message: Messages) => {
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES:
        return proto_oa_get_trendbars_res(message);
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        return proto_oa_spot_event(message);
    }
  };
}
