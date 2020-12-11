const T = require("../../build/utils/trendbar");

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
