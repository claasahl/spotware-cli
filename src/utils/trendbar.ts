import {
  ProtoOAPayloadType,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  PROTO_OA_GET_TRENDBARS_RES,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";

export interface Trendbar {
  timestamp: number;
  period: ProtoOATrendbarPeriod;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
