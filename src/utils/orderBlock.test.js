const { structurePoints2 } = require("../../build/utils/structurePoints");
const { orderBlocks } = require("../../build/utils/orderBlock");

describe("order block", () => {
  describe("real world examples", () => {
    test("XAUUSD H4 2021-02-25", () => {
      const bars = require("../../testdata/xauusd--h4--2021-02.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-02-25T02:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("XAUUSD H1 2021-03-29", () => {
      const bars = require("../../testdata/xauusd--h1--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-29T10:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("XAUUSD H1 2021-04-23", () => {
      const bars = require("../../testdata/xauusd--h1--2021-04.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-04-23T12:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("XAUUSD M5 2021-04-23", () => {
      const bars = require("../../testdata/xauusd--m5--2021-04.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-04-23T13:45:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("NZDUSD H4 2021-03-04", () => {
      const bars = require("../../testdata/nzdusd--h4--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-04T10:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("NZDUSD H4 2021-03-17", () => {
      const bars = require("../../testdata/nzdusd--h4--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-17T21:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("NZDUSD H4 2021-03-22", () => {
      const bars = require("../../testdata/nzdusd--h4--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-22T13:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
  });
});
