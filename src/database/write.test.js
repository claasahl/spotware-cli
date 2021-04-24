const fs = require("fs");
const { join } = require("path");
const {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

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
    test("should write trendbars to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const trendbars = [
        {
          volume: 568982,
          low: 118355,
          deltaOpen: 819,
          deltaClose: 1179,
          deltaHigh: 1544,
          utcTimestampInMinutes: 120,
        },
        {
          volume: 471709,
          low: 118739,
          deltaOpen: 721,
          deltaClose: 302,
          deltaHigh: 1150,
          utcTimestampInMinutes: 180,
        },
      ];
      const period = {
        fromTimestamp: new Date(60 * 60000).getTime(),
        toTimestamp: new Date(180 * 60000).getTime(),
      };
      await writeTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOATrendbarPeriod.H1,
        trendbars
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "H1",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        JSON.stringify(trendbars)
      );
    });
    test("should write empty/no trendbars to file", async () => {
      fs.promises.writeFile.mockResolvedValue();
      const trendbars = [];
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      await writeTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOATrendbarPeriod.H1,
        trendbars
      );
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        join(
          "EURUSD.DB",
          "H1",
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json"
        ),
        "[]"
      );
    });
  });
});
