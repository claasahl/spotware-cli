import {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";

import { Trendbar } from "../utils";

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
}
export function toLiveTrendbar(
  options: Options,
  trendbar: Trendbar
): PROTO_OA_SPOT_EVENT {
  const { ctidTraderAccountId, symbolId, period } = options;
  const { volume, open, high, low, close, timestamp } = trendbar;
  return {
    payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
    payload: {
      ctidTraderAccountId,
      symbolId,
      trendbar: [
        {
          volume,
          period,
          low,
          deltaOpen: open - low,
          deltaHigh: high - low,
          utcTimestampInMinutes: Math.round(timestamp / 60000),
        },
      ],
      bid: close,
    },
  };
}
