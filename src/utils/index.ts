import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  PROTO_OA_GET_TRENDBARS_RES,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";
import ms from "ms";

export interface Trendbar {
  timestamp: number;
  period: ProtoOATrendbarPeriod;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
const FACTOR = Math.pow(10, 5);
export function price(price: number): number {
  return price / FACTOR;
}

function isLiveTrendbar(
  bar: ProtoOATrendbar
): bar is Required<Omit<ProtoOATrendbar, "deltaClose">> {
  return (
    typeof bar.deltaHigh === "number" &&
    typeof bar.deltaOpen === "number" &&
    typeof bar.low === "number" &&
    typeof bar.period === "number" &&
    typeof bar.utcTimestampInMinutes === "number"
  );
}
function isTrendbar(bar: ProtoOATrendbar): bar is Required<ProtoOATrendbar> {
  return (
    typeof bar.deltaHigh === "number" &&
    typeof bar.deltaOpen === "number" &&
    typeof bar.deltaClose === "number" &&
    typeof bar.low === "number" &&
    typeof bar.utcTimestampInMinutes === "number"
  );
}
function toTrendbar(
  bar: Required<Omit<ProtoOATrendbar, "period">>,
  period: ProtoOATrendbarPeriod
): Trendbar;
function toTrendbar(
  bar: Required<Omit<ProtoOATrendbar, "deltaClose">>,
  close: number
): Trendbar;
function toTrendbar(
  bar:
    | Required<Omit<ProtoOATrendbar, "deltaClose">>
    | Required<Omit<ProtoOATrendbar, "period">>,
  periodOrClose: number | ProtoOATrendbarPeriod
): Trendbar {
  if ("deltaClose" in bar) {
    return {
      timestamp: bar.utcTimestampInMinutes * 60000,
      period: periodOrClose,
      open: bar.low + bar.deltaOpen,
      high: bar.low + bar.deltaHigh,
      low: bar.low,
      close: bar.low + bar.deltaClose,
      volume: bar.volume,
    };
  }
  return {
    timestamp: bar.utcTimestampInMinutes * 60000,
    period: bar.period,
    open: bar.low + bar.deltaOpen,
    high: bar.low + bar.deltaHigh,
    low: bar.low,
    close: periodOrClose,
    volume: bar.volume,
  };
}
export function trendbars(
  message: PROTO_OA_SPOT_EVENT | PROTO_OA_GET_TRENDBARS_RES
): Trendbar[] {
  if (message.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
    const bid = message.payload.bid;
    if (!bid) {
      return [];
    }
    return message.payload.trendbar
      .filter(isLiveTrendbar)
      .map((bar) => toTrendbar(bar, bid));
  } else if (
    message.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES
  ) {
    return message.payload.trendbar.filter(isTrendbar).map(toTrendbar);
  }
  return [];
}

export function period(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.M1:
      return ms("1m");
    case ProtoOATrendbarPeriod.M2:
      return ms("2m");
    case ProtoOATrendbarPeriod.M3:
      return ms("3m");
    case ProtoOATrendbarPeriod.M4:
      return ms("4m");
    case ProtoOATrendbarPeriod.M5:
      return ms("5m");
    case ProtoOATrendbarPeriod.M10:
      return ms("10m");
    case ProtoOATrendbarPeriod.M15:
      return ms("15m");
    case ProtoOATrendbarPeriod.M30:
      return ms("30m");
    case ProtoOATrendbarPeriod.H1:
      return ms("1h");
    case ProtoOATrendbarPeriod.H4:
      return ms("4h");
    case ProtoOATrendbarPeriod.H12:
      return ms("12h");
    case ProtoOATrendbarPeriod.D1:
      return ms("1d");
    case ProtoOATrendbarPeriod.W1:
      return ms("1w");
    case ProtoOATrendbarPeriod.MN1:
      throw new Error("cannot convert 1MN to millis");
  }
}

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
