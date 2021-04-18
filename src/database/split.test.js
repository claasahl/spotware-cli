const {
  retainAvailablePeriods,
  retainUnknownPeriods,
} = require("../../build/database/split");

describe("Database", () => {
  describe("retainAvailablePeriods", () => {
    test("no available periods, nothing to retain", () => {
      //    period: ----
      // available:
      //  retained:
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [];
      const retained = [];
      expect(retainAvailablePeriods(period, available)).toStrictEqual(retained);
    });
    test("should retain available periods", () => {
      //    period:  --------
      // available: --  --  ----
      //  retained:  ^  ^^  ^
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [
        {
          fromTimestamp: 80,
          toTimestamp: 110,
        },
        {
          fromTimestamp: 120,
          toTimestamp: 140,
        },
        {
          fromTimestamp: 170,
          toTimestamp: 400,
        },
      ];
      const retained = [
        {
          fromTimestamp: 100,
          toTimestamp: 110,
        },
        {
          fromTimestamp: 120,
          toTimestamp: 140,
        },
        {
          fromTimestamp: 170,
          toTimestamp: 200,
        },
      ];
      expect(retainAvailablePeriods(period, available)).toStrictEqual(retained);
    });
  });

  describe("retainUnknownPeriods", () => {
    test("no available periods, retain initial input", () => {
      //    period: ----
      // available:
      //  retained: ^^^^
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [];
      const retained = [period];
      expect(retainUnknownPeriods(period, available)).toStrictEqual(retained);
    });
    test("should retain unknown periods", () => {
      //    period:  --------
      // available: --  --  ----
      //  retained:   ^^  ^^
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [
        {
          fromTimestamp: 80,
          toTimestamp: 110,
        },
        {
          fromTimestamp: 120,
          toTimestamp: 140,
        },
        {
          fromTimestamp: 170,
          toTimestamp: 400,
        },
      ];
      const retained = [
        {
          fromTimestamp: 110,
          toTimestamp: 120,
        },
        {
          fromTimestamp: 140,
          toTimestamp: 170,
        },
      ];
      expect(retainUnknownPeriods(period, available)).toStrictEqual(retained);
    });
  });
});
