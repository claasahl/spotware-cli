const fs = require("fs");
const {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

const {
  readQuotePeriods,
  readTrendbarPeriods,
  readQuotes,
  readTrendbars,
} = require("../../build/database/read");

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe("Database", () => {
  describe("readQuotePeriods", () => {
    const a = {
      fromTimestamp: 100,
      toTimestamp: 200,
    };
    const b = {
      fromTimestamp: 400,
      toTimestamp: 800,
    };
    const c = {
      fromTimestamp: 380,
      toTimestamp: 420,
    };
    test("should extract periods from file names", async () => {
      fs.promises.readdir.mockResolvedValue([
        "some_random_file.json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
      ]);
      const periods = await readQuotePeriods(
        "./EURUSD.DB",
        ProtoOAQuoteType.ASK
      );
      expect(periods).toStrictEqual([a, b]);
    });
    test("should sort periods", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(c)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
      ]);
      const periods = await readQuotePeriods(
        "./EURUSD.DB",
        ProtoOAQuoteType.BID
      );
      expect(periods).toStrictEqual([a, c, b]);
    });
  });

  describe("readTrendbarPeriods", () => {
    const a = {
      fromTimestamp: 100,
      toTimestamp: 200,
    };
    const b = {
      fromTimestamp: 400,
      toTimestamp: 800,
    };
    const c = {
      fromTimestamp: 380,
      toTimestamp: 420,
    };
    test("should extract periods from file names", async () => {
      fs.promises.readdir.mockResolvedValue([
        "some_random_file.json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
      ]);
      const periods = await readTrendbarPeriods(
        "./EURUSD.DB",
        ProtoOATrendbarPeriod.D1
      );
      expect(periods).toStrictEqual([a, b]);
    });
    test("should sort periods", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(c)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
      ]);
      const periods = await readTrendbarPeriods(
        "./EURUSD.DB",
        ProtoOATrendbarPeriod.M15
      );
      expect(periods).toStrictEqual([a, c, b]);
    });
  });

  describe("readQuotes", () => {
    test("should read tick data from file", async () => {
      const originalTickData = [
        { timestamp: 100, tick: 3 },
        { timestamp: 200, tick: 45 },
      ];
      fs.promises.readFile.mockResolvedValue(JSON.stringify(originalTickData));
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const tickData = await readQuotes(
        "./EURUSD.DB",
        period,
        ProtoOAQuoteType.ASK
      );
      expect(tickData).toStrictEqual(originalTickData);
    });
    test("should complain if file does not contain a JSON array", async (done) => {
      fs.promises.readFile.mockResolvedValue("hello world");
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      try {
        await readQuotes("./EURUSD.DB", period, ProtoOAQuoteType.BID);
        done(new Error("should have failed"));
      } catch {
        done();
      }
    });
  });

  describe("readTrendbars", () => {
    test("should read tick data from file", async () => {
      const originalTickData = [
        { timestamp: 100, tick: 3 },
        { timestamp: 200, tick: 45 },
      ];
      fs.promises.readFile.mockResolvedValue(JSON.stringify(originalTickData));
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      const tickData = await readTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOATrendbarPeriod.H4
      );
      expect(tickData).toStrictEqual(originalTickData);
    });
    test("should complain if file does not contain a JSON array", async (done) => {
      fs.promises.readFile.mockResolvedValue("hello world");
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
      };
      try {
        await readTrendbars("./EURUSD.DB", period, ProtoOATrendbarPeriod.M5);
        done(new Error("should have failed"));
      } catch {
        done();
      }
    });
  });
});
