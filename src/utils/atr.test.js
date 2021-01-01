const { atr } = require("../../build/utils/atr");
const {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

describe("Average True Range", () => {
  const ctidTraderAccountId = 0;
  const period = ProtoOATrendbarPeriod.M1;
  const symbolId = 0;
  test("not enough data", () => {
    const ATR = atr({ ctidTraderAccountId, period, periods: 1, symbolId });
    const result = ATR({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId,
        period,
        symbolId,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
        ],
      },
    });
    expect(result).toBeUndefined();
  });
  test("1 candle", () => {
    const ATR = atr({ ctidTraderAccountId, period, periods: 1, symbolId });
    const result = ATR({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId,
        period,
        symbolId,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 0,
            low: 0,
            deltaOpen: 0,
            deltaClose: 0,
            deltaHigh: 0,
            utcTimestampInMinutes: 26716809,
          },
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
        ],
      },
    });
    expect(result).toBe(864000);
  });
  test("2 candles", () => {
    const ATR = atr({ ctidTraderAccountId, period, periods: 2, symbolId });
    const result = ATR({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId,
        period,
        symbolId,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 7,
            low: 976300000,
            deltaOpen: 27000,
            deltaClose: 76000,
            deltaHigh: 71000,
            utcTimestampInMinutes: 26716809,
          },
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
          {
            volume: 26,
            low: 976602000,
            deltaOpen: 0,
            deltaClose: 177000,
            deltaHigh: 744000,
            utcTimestampInMinutes: 26716811,
          },
        ],
      },
    });

    const close0 = 976300000 + 76000;

    const close1 = 976306000 + 176000;
    const range1 = 971000;
    const lowGap1 = Math.abs(976306000 - close0);
    const highGap1 = Math.abs(976306000 + 971000 - close0);
    const atr1 = Math.max(range1, lowGap1, highGap1);

    const range2 = 744000;
    const lowGap2 = Math.abs(976602000 - close1);
    const highGap2 = Math.abs(976602000 + 744000 - close1);
    const atr2 = Math.max(range2, lowGap2, highGap2);

    const expected = Math.round((atr1 + atr2) / 2);
    expect(result).toBe(expected);
  });
});
