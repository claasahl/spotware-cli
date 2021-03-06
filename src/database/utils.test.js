const {
  engulfs,
  touches,
  intersects,
  intersection,
  disjunction,
} = require("../../build/database/utils");

describe("Database", () => {
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

  describe("touches", () => {
    test("period should cannot touch itself", () => {
      // a: -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      expect(touches(a, a)).toBe(false);
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
      expect(touches(a, b)).toBe(false);
      expect(touches(b, a)).toBe(false);
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
      expect(touches(a, b)).toBe(false);
      expect(touches(b, a)).toBe(false);
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
      expect(touches(a, b)).toBe(false);
      expect(touches(b, a)).toBe(false);
    });
    test("periods that touch", () => {
      // a: --
      // b:   --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 150,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 175,
      };
      expect(touches(a, b)).toBe(true);
      expect(touches(b, a)).toBe(true);
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
    test("periods touch, but do not overlap", () => {
      // a: --
      // b:   --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 200,
        toTimestamp: 775,
      };
      expect(intersects(a, b)).toBe(false);
      expect(intersects(b, a)).toBe(false);
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
    test("periods touch, but do not overlap", () => {
      // a: --
      // b:   --
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 200,
        toTimestamp: 775,
      };
      expect(intersection(a, b)).toBe(undefined);
      expect(intersection(b, a)).toBe(undefined);
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
    test("fully disjointed", () => {
      // a: ---
      // b:     ---
      const a = {
        fromTimestamp: 100,
        toTimestamp: 120,
      };
      const b = {
        fromTimestamp: 200,
        toTimestamp: 220,
      };
      expect(disjunction(a, b)).toStrictEqual([a, b]);
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
