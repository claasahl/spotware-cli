const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { isBetween, engulfs, overlaps } = require("../../build/database/utils");

describe("Database", () => {
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

  describe("engulfs", () => {
    test("period should engulf itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(engulfs(a, a)).toBe(true);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
        type: ProtoOAQuoteType.ASK,
      };
      expect(engulfs(a, b)).toBe(true);
      expect(engulfs(b, a)).toBe(false); // needs to fully overlap
    });
    test("same toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:    --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(engulfs(a, b)).toBe(true);
      expect(engulfs(b, a)).toBe(false); // needs to fully overlap
    });
    test("different toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:  --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
        type: ProtoOAQuoteType.ASK,
      };
      expect(engulfs(a, b)).toBe(true);
      expect(engulfs(b, a)).toBe(false); // needs to fully overlap
    });
  });

  describe("overlaps", () => {
    test("period should overlap with itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(overlaps(a, a)).toBe(true);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
        type: ProtoOAQuoteType.ASK,
      };
      expect(overlaps(a, b)).toBe(true);
      expect(overlaps(b, a)).toBe(true);
    });
    test("same toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:    --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(overlaps(a, b)).toBe(true);
      expect(overlaps(b, a)).toBe(true);
    });
    test("different toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:  --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
        type: ProtoOAQuoteType.ASK,
      };
      expect(overlaps(a, b)).toBe(true);
      expect(overlaps(b, a)).toBe(true);
    });
  });
});
