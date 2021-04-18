const { merge } = require("../../build/database/merge");

describe("Database", () => {
  describe("merge", () => {
    test("should merge identical periods", () => {
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      expect(merge(a, a)).toStrictEqual([a]);
    });
    test("should merge overlapping periods", () => {
      // a: -----
      // b:    -----

      // a:    -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 250,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
    });
    test("should merge if periods touch", () => {
      // a: -----
      // b:     -----

      // a:     -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const b = {
        fromTimestamp: 200,
        toTimestamp: 250,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
    });
    test("should merge engulfing", () => {
      // a: -----
      // b:   --

      // a:   --
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 250,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
        },
      ]);
    });
  });
});
