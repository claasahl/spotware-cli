const {
  isBearish,
  isBullish,
  isTop,
  isBottom,
  isBetween,
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

  describe("isBullish", () => {
    test("bar should be bullish", () => {
      const bar = { open: 10, close: 11 };
      expect(isBullish(bar)).toBe(true);
    });
    test("bar should NOT be bullish", () => {
      const bar = { open: 10, close: 8 };
      expect(isBullish(bar)).toBe(false);
    });
    test("bar should NOT be bullish (edge case)", () => {
      const bar = { open: 10, close: 10 };
      expect(isBullish(bar)).toBe(false);
    });
  });

  describe("isTop", () => {
    test("forms a '/'-pattern", () => {
      const bar1 = { close: 10 };
      const bar2 = { close: 12 };
      const bar3 = { close: 11 };
      expect(isTop(bar1, bar2, bar3)).toBe(true);
      expect(isTop(bar3, bar2, bar1)).toBe(true);
    });
    test("forms an 'incline'-pattern", () => {
      const bar1 = { close: 10 };
      const bar2 = { close: 11 };
      const bar3 = { close: 12 };
      expect(isTop(bar1, bar2, bar3)).toBe(false);
    });
    test("forms a 'decline'-pattern", () => {
      const bar1 = { close: 12 };
      const bar2 = { close: 11 };
      const bar3 = { close: 10 };
      expect(isTop(bar1, bar2, bar3)).toBe(false);
    });
  });

  describe("isBottom", () => {
    test("forms a '/'-pattern", () => {
      const bar1 = { close: 12 };
      const bar2 = { close: 10 };
      const bar3 = { close: 11 };
      expect(isBottom(bar1, bar2, bar3)).toBe(true);
      expect(isBottom(bar3, bar2, bar1)).toBe(true);
    });
    test("forms an 'incline'-pattern", () => {
      const bar1 = { close: 10 };
      const bar2 = { close: 11 };
      const bar3 = { close: 12 };
      expect(isBottom(bar1, bar2, bar3)).toBe(false);
    });
    test("forms a 'decline'-pattern", () => {
      const bar1 = { close: 12 };
      const bar2 = { close: 11 };
      const bar3 = { close: 10 };
      expect(isBottom(bar1, bar2, bar3)).toBe(false);
    });
  });

  describe("isBetween", () => {
    test("10 is between 7 and 13", () => {
      expect(isBetween(10, 7, 13)).toBe(true);
    });
    test("10 is between 13 and 7", () => {
      expect(isBetween(10, 13, 7)).toBe(true);
    });
    test("7 is between 7 and 13 (edge case)", () => {
      expect(isBetween(7, 7, 13)).toBe(true);
    });
    test("13 is between 7 and 13 (edge case)", () => {
      expect(isBetween(13, 7, 13)).toBe(true);
    });
    test("5 is NOT between 7 and 13", () => {
      expect(isBetween(5, 7, 13)).toBe(false);
    });
    test("7 is NOT between 7 and 13 (edge case)", () => {
      expect(isBetween(7, 7, 13, false)).toBe(false);
    });
    test("13 is NOT between 7 and 13 (edge case)", () => {
      expect(isBetween(13, 7, 13, false)).toBe(false);
    });
  });
});
