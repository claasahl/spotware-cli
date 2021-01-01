const { atr } = require("../../build/utils/atr");
const {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

describe("Average True Range", () => {
  const ctidTraderAccountId = 0;
  const period = ProtoOATrendbarPeriod.M1;
  const symbolId = 0;
  test("true range, no average", () => {
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
});
