const T = require("../../build/utils/trendbar");
const { ProtoOAPayloadType } = require("@claasahl/spotware-adapter");

describe("isLiveTrendbar", () => {
  test("negative example", () => {
    const result = T.isLiveTrendbar({
      volume: 8,
      low: 976306000,
      deltaOpen: 727000,
      deltaClose: 176000,
      deltaHigh: 971000,
      utcTimestampInMinutes: 26716810,
    });
    expect(result).toBe(false);
  });
  test("positive example", () => {
    const result = T.isLiveTrendbar({
      volume: 10,
      period: 1,
      low: 976891000,
      deltaOpen: 0,
      deltaHigh: 18000,
      utcTimestampInMinutes: 26717050,
    });
    expect(result).toBe(true);
  });
});

describe("isTrendbar", () => {
  test("postive example", () => {
    const result = T.isTrendbar({
      volume: 8,
      low: 976306000,
      deltaOpen: 727000,
      deltaClose: 176000,
      deltaHigh: 971000,
      utcTimestampInMinutes: 26716810,
    });
    expect(result).toBe(true);
  });
  test("postive example (edge case)", () => {
    const result = T.isTrendbar({
      volume: 6724,
      low: 76866,
      deltaOpen: 0,
      deltaClose: 298,
      deltaHigh: 304,
      utcTimestampInMinutes: 26828700,
    });
    expect(result).toBe(true);
  });
  test("negative example", () => {
    const result = T.isTrendbar({
      volume: 10,
      period: 1,
      low: 976891000,
      deltaOpen: 0,
      deltaHigh: 18000,
      utcTimestampInMinutes: 26717050,
    });
    expect(result).toBe(false);
  });
});

describe("toTrendbar", () => {
  test("convert historical trendbar", () => {
    const result = T.toTrendbar(
      {
        volume: 8,
        low: 976306000,
        deltaOpen: 727000,
        deltaClose: 176000,
        deltaHigh: 971000,
        utcTimestampInMinutes: 26716810,
      },
      2
    );
    expect(result).toStrictEqual({
      timestamp: 26716810 * 60000,
      period: 2,
      open: 977033000,
      high: 977277000,
      low: 976306000,
      close: 976482000,
      volume: 8,
    });
  });
  test("convert live trendbar", () => {
    const result = T.toTrendbar(
      {
        volume: 10,
        period: 1,
        low: 976891000,
        deltaOpen: 1000,
        deltaHigh: 18000,
        utcTimestampInMinutes: 26717050,
      },
      976904500
    );
    expect(result).toStrictEqual({
      timestamp: 26717050 * 60000,
      period: 1,
      open: 976892000,
      high: 976909000,
      low: 976891000,
      close: 976904500,
      volume: 10,
    });
  });
});

describe("trendbars", () => {
  test("convert historical trendbar(s)", () => {
    const result = T.trendbars({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
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
      clientMsgId: "cf5e3520-8916-48b6-aa32-c334cf0ac0ea",
    });
    expect(result).toStrictEqual([
      {
        timestamp: 26716810 * 60000,
        period: 1,
        open: 976306000 + 727000,
        high: 976306000 + 971000,
        low: 976306000,
        close: 976306000 + 176000,
        volume: 8,
      },
      {
        timestamp: 26716811 * 60000,
        period: 1,
        open: 976602000 + 0,
        high: 976602000 + 744000,
        low: 976602000,
        close: 976602000 + 177000,
        volume: 26,
      },
      {
        timestamp: 26716812 * 60000,
        period: 1,
        open: 976779000 + 1000,
        high: 976779000 + 258000,
        low: 976779000,
        close: 976779000 + 1000,
        volume: 9,
      },
    ]);
  });
  test("convert live trendbar(s)", () => {
    const result = T.trendbars({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717050,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual([
      {
        timestamp: 26717050 * 60000,
        period: 1,
        open: 976891000,
        high: 976909000,
        low: 976891000,
        close: 976909000,
        volume: 10,
      },
    ]);
  });
});

describe("bufferedTrendbars", () => {
  test("buffer historical trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
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
      clientMsgId: "cf5e3520-8916-48b6-aa32-c334cf0ac0ea",
    });
    expect(result).toStrictEqual({
      added: [
        {
          timestamp: 26716811 * 60000,
          period: 1,
          open: 976602000 + 0,
          high: 976602000 + 744000,
          low: 976602000,
          close: 976602000 + 177000,
          volume: 26,
        },
        {
          timestamp: 26716812 * 60000,
          period: 1,
          open: 976779000 + 1000,
          high: 976779000 + 258000,
          low: 976779000,
          close: 976779000 + 1000,
          volume: 9,
        },
      ],
      removed: [],
      bars: [
        {
          timestamp: 26716811 * 60000,
          period: 1,
          open: 976602000 + 0,
          high: 976602000 + 744000,
          low: 976602000,
          close: 976602000 + 177000,
          volume: 26,
        },
        {
          timestamp: 26716812 * 60000,
          period: 1,
          open: 976779000 + 1000,
          high: 976779000 + 258000,
          low: 976779000,
          close: 976779000 + 1000,
          volume: 9,
        },
      ],
    });
  });
  test("update live trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 9999,
            period: 1,
            low: 976891000,
            deltaOpen: 1,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717050,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717050,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [
        {
          timestamp: 26717050 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
      removed: [
        {
          timestamp: 26717050 * 60000,
          period: 1,
          open: 976891001,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 9999,
        },
      ],
      bars: [
        {
          timestamp: 26717050 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
    });
  });
  test("buffer live trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 9999,
            period: 1,
            low: 976891000,
            deltaOpen: 1,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717050,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717051,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [
        {
          timestamp: 26717051 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
      removed: [],
      bars: [
        {
          timestamp: 26717050 * 60000,
          period: 1,
          open: 976891001,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 9999,
        },
        {
          timestamp: 26717051 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
    });
  });
  test("ignore live trendbars from other symbols", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 99999,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717051,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("ignore live trendbars from other accounts", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 99999999,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717051,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("ignore live trendbars with other periods", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 999,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717051,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("ignore historical trendbars from other symbols", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
        ],
        symbolId: 99999,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("ignore historical trendbars from other accounts", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 9999999,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
        ],
        symbolId: 22396,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("ignore historical trendbars with other periods", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 999,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
        ],
        symbolId: 22396,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("dont buffer any live trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 0,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
        ],
        symbolId: 22396,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("dont buffer any historical trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 0,
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
          {
            volume: 8,
            low: 976306000,
            deltaOpen: 727000,
            deltaClose: 176000,
            deltaHigh: 971000,
            utcTimestampInMinutes: 26716810,
          },
        ],
        symbolId: 22396,
      },
    });
    expect(result).toStrictEqual({
      added: [],
      removed: [],
      bars: [],
    });
  });
  test("should 'drop' oldest trendbars", () => {
    const buffer = T.bufferedTrendbars({
      ctidTraderAccountId: 17403192,
      symbolId: 22396,
      period: 1,
      periods: 2,
    });
    buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
      payload: {
        ctidTraderAccountId: 17403192,
        period: 1,
        timestamp: 1603023000000,
        trendbar: [
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
      clientMsgId: "cf5e3520-8916-48b6-aa32-c334cf0ac0ea",
    });
    const result = buffer({
      payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
      payload: {
        ctidTraderAccountId: 17403192,
        symbolId: 22396,
        trendbar: [
          {
            volume: 10,
            period: 1,
            low: 976891000,
            deltaOpen: 0,
            deltaHigh: 18000,
            utcTimestampInMinutes: 26717051,
          },
        ],
        bid: 976909000,
        ask: 977498000,
        sessionClose: 971247000,
      },
    });
    expect(result).toStrictEqual({
      added: [
        {
          timestamp: 26717051 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
      removed: [
        {
          timestamp: 26716811 * 60000,
          period: 1,
          open: 976602000 + 0,
          high: 976602000 + 744000,
          low: 976602000,
          close: 976602000 + 177000,
          volume: 26,
        },
      ],
      bars: [
        {
          timestamp: 26716812 * 60000,
          period: 1,
          open: 976779000 + 1000,
          high: 976779000 + 258000,
          low: 976779000,
          close: 976779000 + 1000,
          volume: 9,
        },
        {
          timestamp: 26717051 * 60000,
          period: 1,
          open: 976891000,
          high: 976909000,
          low: 976891000,
          close: 976909000,
          volume: 10,
        },
      ],
    });
  });
});
