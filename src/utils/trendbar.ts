import {
  Messages,
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

export function isLiveTrendbar(
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
export function isTrendbar(
  bar: ProtoOATrendbar
): bar is Required<ProtoOATrendbar> {
  return (
    typeof bar.deltaHigh === "number" &&
    typeof bar.deltaOpen === "number" &&
    typeof bar.deltaClose === "number" &&
    typeof bar.low === "number" &&
    typeof bar.utcTimestampInMinutes === "number"
  );
}
export function toTrendbar(
  bar: Required<Omit<ProtoOATrendbar, "period">>,
  period: ProtoOATrendbarPeriod
): Trendbar;
export function toTrendbar(
  bar: Required<Omit<ProtoOATrendbar, "deltaClose">>,
  close: number
): Trendbar;
export function toTrendbar(
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
    return message.payload.trendbar
      .filter(isTrendbar)
      .map((bar) => toTrendbar(bar, message.payload.period));
  }
  return [];
}

function removeIsNewField(bar: Trendbar & { isNew?: boolean }): Trendbar {
  const { isNew, ...rest } = bar;
  return rest;
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods:
    | number
    | ((bar: Trendbar, index: number, bars: Trendbar[]) => boolean);
}
interface Result {
  bars: Trendbar[];
  added: Trendbar[];
  removed: Trendbar[];
}
export function bufferedTrendbars(options: Options) {
  const data: (Trendbar & { isNew?: boolean })[] = [];
  function value(added: Trendbar[] = [], removed: Trendbar[] = []): Result {
    return { bars: data, added, removed };
  }
  const keptTheseBars =
    typeof options.periods === "number"
      ? (_: Trendbar, index: number, bars: Trendbar[]) =>
          bars.length - index - 1 < options.periods
      : options.periods;
  const removedTheseBars = (bar: Trendbar, index: number, bars: Trendbar[]) =>
    !keptTheseBars(bar, index, bars);
  function proto_oa_get_trendbars_res(msg: PROTO_OA_GET_TRENDBARS_RES) {
    if (msg.payload.ctidTraderAccountId !== options.ctidTraderAccountId) {
      return value();
    } else if (msg.payload.symbolId !== options.symbolId) {
      return value();
    } else if (msg.payload.period !== options.period) {
      return value();
    }

    const bars = trendbars(msg).map((b) => ({ ...b, isNew: true }));
    const sorted = [...bars, ...data].sort((a, b) => a.timestamp - b.timestamp);
    const allBars = sorted.filter(keptTheseBars);
    const removed = sorted.filter(removedTheseBars).filter((b) => !b.isNew);
    const added = allBars.filter((b) => b.isNew).map(removeIsNewField);

    data.splice(0);
    data.push(...allBars.map(removeIsNewField));
    return value(added, removed);
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

    const added: Trendbar[] = [];
    const removed: Trendbar[] = [];
    if (
      data.length > 0 &&
      data[data.length - 1].timestamp === bars[0].timestamp
    ) {
      const bars = data.splice(data.length - 1);
      removed.push(...bars);
    }
    added.push(bars[0]);
    data.push(bars[0]);

    const allBars = data.filter(keptTheseBars).map(removeIsNewField);
    const alsoRemoved = data.filter(removedTheseBars).filter((b) => !b.isNew);

    data.splice(0);
    data.push(...allBars);
    return value(added, [...alsoRemoved, ...removed]);
  }
  return (message: Messages) => {
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES:
        return proto_oa_get_trendbars_res(message);
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        return proto_oa_spot_event(message);
      default:
        return value();
    }
  };
}
