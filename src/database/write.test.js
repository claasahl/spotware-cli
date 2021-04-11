const fs = require("fs");
const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { write } = require("../../build/database/write");

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe("Database", () => {
  describe("write", () => {
    test("should write tick data to file", async () => {
      const tickData = [
        { timestamp: 100 },
        { timestamp: 50 },
        { timestamp: 25 },
      ];
      const period = await write("./EURUSD.DB", ProtoOAQuoteType.BID, tickData);
      expect(period).toStrictEqual({
        fromTimestamp: 25,
        toTimestamp: 100,
        type: ProtoOAQuoteType.BID,
      });
    });
    test("will fail without tick data", async (done) => {
      const tickData = [];
      try {
        await write("./EURUSD.DB", ProtoOAQuoteType.BID, tickData);
        done(new Error("should have failed"));
      } catch {
        done();
      }
    });
  });
});
