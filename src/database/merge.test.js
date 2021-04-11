const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { merge } = require("../../build/database/merge");

describe("Database", () => {
  describe("merge", () => {
    test("shoule merge identical periods", () => {
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(merge(a, a)).toStrictEqual([a]);
    });
    test("cannot merge periods of different types", () => {
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 250,
        type: ProtoOAQuoteType.BID,
      };
      expect(merge(a, b)).toStrictEqual([a, b]);
    });
    test("should merge overlapping periods", () => {
      // a: -----
      // b:    -----

      // a:    -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 250,
        type: ProtoOAQuoteType.ASK,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
        },
      ]);
    });
    test("should merge if periods meet", () => {
      // a: -----
      // b:     -----

      // a:     -----
      // b: -----
      const a = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 200,
        toTimestamp: 250,
        type: ProtoOAQuoteType.ASK,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
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
        type: ProtoOAQuoteType.ASK,
      };
      const b = {
        fromTimestamp: 150,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      expect(merge(a, b)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
        },
      ]);
      expect(merge(b, a)).toStrictEqual([
        {
          fromTimestamp: 100,
          toTimestamp: 250,
          type: ProtoOAQuoteType.ASK,
        },
      ]);
    });
  });
});
