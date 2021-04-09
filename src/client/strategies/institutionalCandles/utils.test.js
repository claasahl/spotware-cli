const {
  isBearish,
  isBullish,
  isTop,
  isBottom,
  isBetween,
  isTopIC,
  isBottomIC,
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

  describe("isTopIC", () => {
    test("should be top IC", () => {
      const prev = { close: 35 };
      const bar = { open: 35, close: 40 };
      const next1 = { open: 40, close: 30 };
      const next2 = { open: 30, close: 20 };
      const next3 = { open: 20, close: 10 };
      expect(isTopIC([prev, bar, next1, next2, next3])).toBe(true);
    });
    test("top IC requires a bullish thrust", () => {
      const prev = { close: 40 };
      const bar = { open: 40, close: 40 }; // needs to be a thrust
      const next1 = { open: 40, close: 30 };
      const next2 = { open: 30, close: 20 };
      const next3 = { open: 20, close: 10 };
      expect(isTopIC([prev, bar, next1, next2, next3])).toBe(false);
    });
    test("top IC requires a bearish thrust", () => {
      const prev = { close: 30 };
      const bar = { open: 30, close: 40 };
      const next1 = { open: 40, close: 30 }; // needs to exceed previous thrust
      const next2 = { open: 30, close: 20 };
      const next3 = { open: 20, close: 10 };
      expect(isTopIC([prev, bar, next1, next2, next3])).toBe(false);
    });
    test("top IC requires a bearish tail", () => {
      const prev = { close: 35 };
      const bar = { open: 35, close: 40 };
      const next1 = { open: 40, close: 30 };
      const next2 = { open: 30, close: 30 }; // needs to be bearish
      const next3 = { open: 30, close: 35 }; // needs to be bearish
      expect(isTopIC([prev, bar, next1, next2, next3])).toBe(false);
    });
  });

  describe("isBottomIC", () => {
    test("should be bottom IC", () => {
      const prev = { close: 15 };
      const bar = { open: 15, close: 10 };
      const next1 = { open: 10, close: 20 };
      const next2 = { open: 20, close: 30 };
      const next3 = { open: 30, close: 40 };
      expect(isBottomIC([prev, bar, next1, next2, next3])).toBe(true);
    });
    test("bottom IC requires a bearish thrust", () => {
      const prev = { close: 10 };
      const bar = { open: 10, close: 10 }; // needs to be a thrust
      const next1 = { open: 10, close: 20 };
      const next2 = { open: 20, close: 30 };
      const next3 = { open: 30, close: 40 };
      expect(isBottomIC([prev, bar, next1, next2, next3])).toBe(false);
    });
    test("bottom IC requires a bullish thrust", () => {
      const prev = { close: 20 };
      const bar = { open: 20, close: 10 };
      const next1 = { open: 10, close: 20 }; // needs to exceed previous thrust
      const next2 = { open: 20, close: 30 };
      const next3 = { open: 30, close: 40 };
      expect(isBottomIC([prev, bar, next1, next2, next3])).toBe(false);
    });
    test("bottom IC requires bullish tail", () => {
      const prev = { close: 15 };
      const bar = { open: 15, close: 10 };
      const next1 = { open: 10, close: 20 };
      const next2 = { open: 20, close: 20 }; // needs to be bearish
      const next3 = { open: 20, close: 15 }; // needs to be bearish
      expect(isBottomIC([prev, bar, next1, next2, next3])).toBe(false);
    });
  });
});
