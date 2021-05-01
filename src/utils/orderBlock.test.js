const { structurePoints2 } = require("../../build/utils/structurePoints");
const { orderBlocks } = require("../../build/utils/orderBlock");

describe("order block", () => {
  describe("real world examples", () => {
    //
    // XAUUSD
    //
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

    //
    // NZDUSD
    //
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

    //
    // GBPJPY
    //
    test("GBPJPY H4 2020-12-11", () => {
      const bars = require("../../testdata/gbpjpy--h4--2020-12.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2020-12-11T10:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("GBPJPY H4 2021-03-24", () => {
      const bars = require("../../testdata/gbpjpy--h4--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-24T17:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("GBPJPY H1 2021-04-19", () => {
      const bars = require("../../testdata/gbpjpy--h1--2021-04.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-04-19T08:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });

    //
    // GBPUSD
    //
    test("GBPUSD H4 2021-02-04", () => {
      const bars = require("../../testdata/gbpusd--h4--2021-02.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-02-04T06:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
    test("GBPUSD M30 2021-03-24", () => {
      const bars = require("../../testdata/gbpusd--m30--2021-04.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-04-22T10:30:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });

    //
    // EURUSD
    //
    test("EURUSD H4 2021-03-3", () => {
      const bars = require("../../testdata/eurusd--h4--2021-03.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-03T06:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });

    //
    // AUDUSD
    //
    test("AUDUSD H1 2021-01-06", () => {
      const bars = require("../../testdata/audusd--h1--2021-01.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-01-06T23:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
  });
});
