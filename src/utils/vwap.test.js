const { vwap } = require("../../build/utils/vwap");
const {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

describe("(Estimated) Volume Weighted Average Price", () => {
  test("accumulate all bars", () => {
    const VWAP = vwap({ ctidTraderAccountId: 17403192, symbolId: 22396 });
    const result = VWAP({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: ProtoOATrendbarPeriod.M1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 0,
          },
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
          {
            volume: 9,
            low: 976779000,
            deltaOpen: 1000,
            deltaClose: 1000,
            deltaHigh: 258000,
            utcTimestampInMinutes: 26716812,
          },
        ],
        symbolId: 22396,
      },
    });
    const a = (976306000 + 176000) * 8;
    const b = (976602000 + 177000) * 26;
    const c = (976779000 + 1000) * 9;
    expect(result).toBe(Math.round((a + b + c) / (8 + 26 + 9)));
  });
  test("accumulate today's bars", () => {
    const VWAP = vwap({ ctidTraderAccountId: 17403192, symbolId: 22396 });
    VWAP({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: ProtoOATrendbarPeriod.D1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716800,
          },
        ],
        symbolId: 22396,
      },
    });
    const result = VWAP({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: ProtoOATrendbarPeriod.M1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 0,
          },
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
          {
            volume: 9,
            low: 976779000,
            deltaOpen: 1000,
            deltaClose: 1000,
            deltaHigh: 258000,
            utcTimestampInMinutes: 26716812,
          },
        ],
        symbolId: 22396,
      },
    });
    const b = (976602000 + 177000) * 26;
    const c = (976779000 + 1000) * 9;
    expect(result).toBe(Math.round((b + c) / (26 + 9)));
  });
  test("accumulate today's bars555555555555", () => {
    const VWAP = vwap({ ctidTraderAccountId: 17403192, symbolId: 22396 });
    VWAP({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: ProtoOATrendbarPeriod.D1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716900,
          },
        ],
        symbolId: 22396,
      },
    });
    const result = VWAP({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: ProtoOATrendbarPeriod.M1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 0,
          },
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
          {
            volume: 9,
            low: 976779000,
            deltaOpen: 1000,
            deltaClose: 1000,
            deltaHigh: 258000,
            utcTimestampInMinutes: 26716812,
          },
        ],
        symbolId: 22396,
      },
    });
    expect(result).toBeUndefined();
  });
});
