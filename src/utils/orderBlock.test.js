const { structurePoints2 } = require("../../build/utils/structurePoints");
const { orderBlocks } = require("../../build/utils/orderBlock");

describe("order block", () => {
  describe("real world examples", () => {
    test("XAUUSD H1 2021-03-29", () => {
      const bars = require("../../testdata/xauusd--h1--2021-03-29.json");
      const points = structurePoints2(bars);
      const blocks = orderBlocks(bars, points);

      const timestamp = new Date("2021-03-29T13:00:00.000Z").getTime();
      const ob = blocks.filter((ob) => ob.timestamp === timestamp)[0];
      expect(ob).toStrictEqual(
        expect.objectContaining({
          timestamp,
        })
      );
    });
  });
});
