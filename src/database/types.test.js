const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { isPeriod, comparePeriod } = require("../../build/database/types");

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

  describe("comparePeriod", () => {
    test("periods without overlap", () => {
      // a: --
      // b:       ----

      // a:       ----
      // b: --
      const a = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(comparePeriod(a, b) < 0).toBe(true);
      expect(comparePeriod(b, a) > 0).toBe(true);
    });
    test("periods differ in fromTimestamp", () => {
      const a = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 12,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      expect(comparePeriod(a, b) < 0).toBe(true);
      expect(comparePeriod(b, a) > 0).toBe(true);
    });
    test("periods differ in toTimestamp", () => {
      const a = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 10,
        toTimestamp: 22,
        type: ProtoOAQuoteType.ASK,
      };
      expect(comparePeriod(a, b) < 0).toBe(true);
      expect(comparePeriod(b, a) > 0).toBe(true);
    });
    test("periods differ in type", () => {
      const a = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.BID,
      };
      const b = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      expect(comparePeriod(a, b) < 0).toBe(true);
      expect(comparePeriod(b, a) > 0).toBe(true);
    });
    test("identical periods", () => {
      const a = {
        fromTimestamp: 10,
        toTimestamp: 20,
        type: ProtoOAQuoteType.ASK,
      };
      const result = comparePeriod(a, a);
      expect(result === 0).toBe(true);
    });
  });
});
