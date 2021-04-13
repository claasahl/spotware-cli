const {
  retainAvailablePeriods,
  retainUnknownPeriods,
} = require("../../build/database/split");

describe("Database", () => {
  describe("retainAvailablePeriods", () => {
    test("no available periods, nothing to retain", () => {
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [];
      const retained = [];
      expect(retainAvailablePeriods(period, available)).toStrictEqual(retained);
    });
  });

  describe("retainUnknownPeriods", () => {
    test("no available periods, retain initial input", () => {
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const available = [];
      const retained = [period];
      expect(retainUnknownPeriods(period, available)).toStrictEqual(retained);
    });
  });
});
