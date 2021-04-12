const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const {
  isBetween,
  engulfs,
  intersects,
  intersection,
  disjunction,
} = require("../../build/database/utils");

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
      };
      expect(engulfs(a, a)).toBe(true);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
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
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
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
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
      };
      expect(engulfs(a, b)).toBe(true);
      expect(engulfs(b, a)).toBe(false); // needs to fully overlap
    });
  });

  describe("intersects", () => {
    test("period should overlap with itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      expect(intersects(a, a)).toBe(true);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
      };
      expect(intersects(a, b)).toBe(true);
      expect(intersects(b, a)).toBe(true);
    });
    test("same toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:    --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
      };
      expect(intersects(a, b)).toBe(true);
      expect(intersects(b, a)).toBe(true);
    });
    test("different toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:  --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
      };
      expect(intersects(a, b)).toBe(true);
      expect(intersects(b, a)).toBe(true);
    });
  });

  describe("intersection", () => {
    test("period should overlap with itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      expect(intersection(a, a)).toStrictEqual(a);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
      };
      expect(intersection(a, b)).toStrictEqual(b);
      expect(intersection(b, a)).toStrictEqual(b);
    });
    test("same toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:    --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
      };
      expect(intersection(a, b)).toStrictEqual(b);
      expect(intersection(b, a)).toStrictEqual(b);
    });
    test("different toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:  --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
      };
      expect(intersection(a, b)).toStrictEqual(b);
      expect(intersection(b, a)).toStrictEqual(b);
    });
  });

  describe("disjunction", () => {
    test("period is not disjoint with itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      expect(disjunction(a, a)).toStrictEqual([]);
    });
    test("same fromTimestamp, different toTimestamp", () => {
      // a: -----
      // b: ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 100,
        toTimestamp: 150,
      };
      const expected = [
        {
          fromTimestamp: 150,
          toTimestamp: 200,
        },
      ];
      expect(disjunction(a, b)).toStrictEqual(expected);
      expect(disjunction(b, a)).toStrictEqual(expected);
    });
    test("same toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:    --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
      };
      const expected = [
        {
          fromTimestamp: 100,
          toTimestamp: 150,
        },
      ];
      expect(disjunction(a, b)).toStrictEqual(expected);
      expect(disjunction(b, a)).toStrictEqual(expected);
    });
    test("different toTimestamp, different fromTimestamp", () => {
      // a: -----
      // b:  --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
      };
      const expected = [
        {
          fromTimestamp: 100,
          toTimestamp: 150,
        },
        {
          fromTimestamp: 175,
          toTimestamp: 200,
        },
      ];
      expect(disjunction(a, b)).toStrictEqual(expected);
      expect(disjunction(b, a)).toStrictEqual(expected);
    });
  });
});
