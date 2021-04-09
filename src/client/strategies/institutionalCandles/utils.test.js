const {
  isBearish,
} = require("../../../../build/client/strategies/institutionalCandles/utils");

describe("Institutional Candles - Utils", () => {
  describe("isBearish", () => {
    test("bar should be bearish", () => {
      const bar = { open: 10, close: 8 };
      expect(isBearish(bar)).toBe(true);
    });
    test("bar should NOT be bearish", () => {
      const bar = { open: 10, close: 11 };
      expect(isBearish(bar)).toBe(false);
    });
    test("bar should NOT be bearish (edge case)", () => {
      const bar = { open: 10, close: 10 };
      expect(isBearish(bar)).toBe(false);
    });
  });
});
