const fs = require("fs");
const { join } = require("path");
const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { writeQuotes, writeTrendbars } = require("../../build/database/write");

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe("Database", () => {
  describe("writeQuotes", () => {
    test("should write tick data to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const tickData = [
        { timestamp: 100, tick: 3 },
        { timestamp: 200, tick: 45 },
      ];
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      await writeQuotes("./EURUSD.DB", period, ProtoOAQuoteType.ASK, tickData);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "ASK",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        JSON.stringify(tickData)
      );
    });
    test("should write empty/no tick data to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const tickData = [];
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      await writeQuotes("./EURUSD.DB", period, ProtoOAQuoteType.BID, tickData);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "BID",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        "[]"
      );
    });
  });

  describe("writeTrendbars", () => {
    test("should write tick data to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const tickData = [
        { timestamp: 100, tick: 3 },
        { timestamp: 200, tick: 45 },
      ];
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      await writeTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOAQuoteType.ASK,
        tickData
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "ASK",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        JSON.stringify(tickData)
      );
    });
    test("should write empty/no tick data to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const tickData = [];
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      await writeTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOAQuoteType.BID,
        tickData
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "BID",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        "[]"
      );
    });
  });
});
