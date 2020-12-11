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
