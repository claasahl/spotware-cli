const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { isPeriod } = require("../../build/database/types");

describe("Database", () => {
  describe("isPeriod", () => {
    test("should be a period", () => {
      const p = {
        fromTimestamp: 110,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(isPeriod(p)).toBe(true);
    });
    test("is missing property: fromTimestamp", () => {
      const p = {
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(isPeriod(p)).toBe(false);
    });
    test("is missing property: toTimestamp", () => {
      const p = {
        fromTimestamp: 110,
        type: ProtoOAQuoteType.ASK,
      };
      expect(isPeriod(p)).toBe(false);
    });
    test("is missing property: type", () => {
      const p = {
        fromTimestamp: 110,
        toTimestamp: 200,
      };
      expect(isPeriod(p)).toBe(false);
    });
    test("should not be a period", () => {
      expect(isPeriod(null)).toBe(false);
      expect(isPeriod(undefined)).toBe(false);
      expect(isPeriod(42)).toBe(false);
      expect(isPeriod("hello world")).toBe(false);
    });
  });
});
