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
  readTrendbarsChunk,
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
    test("should read trendbars data from file", async () => {
      const originalTrendbars = [
        {
          volume: 568982,
          low: 118355,
          deltaOpen: 819,
          deltaClose: 1179,
          deltaHigh: 1544,
          utcTimestampInMinutes:
            new Date("2021-04-18T13:00:00.000Z").getTime() / 60000,
        },
        {
          volume: 471709,
          low: 118739,
          deltaOpen: 721,
          deltaClose: 302,
          deltaHigh: 1150,
          utcTimestampInMinutes:
            new Date("2021-04-18T14:00:00.000Z").getTime() / 60000,
        },
      ];
      fs.promises.readFile.mockResolvedValue(JSON.stringify(originalTrendbars));
      const period = {
        fromTimestamp: new Date("2021-04-18T12:00:00.000Z").getTime(),
        toTimestamp: new Date("2021-04-18T14:00:00.000Z").getTime(),
      };
      const trendbars = await readTrendbars(
        "./EURUSD.DB",
        period,
        ProtoOATrendbarPeriod.H1
      );
      expect(trendbars).toStrictEqual(originalTrendbars);
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

  describe("readTrendbarsChunk", () => {
    const period = Object.freeze({
      fromTimestamp: new Date("2021-02-14T22:00:00.000Z").getTime(),
      toTimestamp: new Date("2021-04-01T00:00:00.000Z").getTime(),
    });
    const chunk = Object.freeze([
      Object.freeze({
        volume: 633406,
        low: 120622,
        deltaOpen: 584,
        deltaClose: 101,
        deltaHigh: 1807,
        utcTimestampInMinutes:
          new Date("2021-02-21T22:00:00.000Z").getTime() / 60000,
      }),
      Object.freeze({
        volume: 627653,
        low: 118927,
        deltaOpen: 1773,
        deltaClose: 179,
        deltaHigh: 2203,
        utcTimestampInMinutes:
          new Date("2021-02-28T22:00:00.000Z").getTime() / 60000,
      }),
      Object.freeze({
        volume: 568982,
        low: 118355,
        deltaOpen: 819,
        deltaClose: 1179,
        deltaHigh: 1544,
        utcTimestampInMinutes:
          new Date("2021-03-07T22:00:00.000Z").getTime() / 60000,
      }),
      Object.freeze({
        volume: 471709,
        deltaOpen: 721,
        deltaClose: 302,
        deltaHigh: 1150,
        utcTimestampInMinutes:
          new Date("2021-03-14T21:00:00.000Z").getTime() / 60000,
      }),
      Object.freeze({
        volume: 465403,
        low: 117618,
        deltaOpen: 1257,
        deltaClose: 318,
        deltaHigh: 1849,
        utcTimestampInMinutes:
          new Date("2021-03-21T21:00:00.000Z").getTime() / 60000,
      }),
      Object.freeze({
        volume: 352142,
        low: 117040,
        deltaOpen: 868,
        deltaClose: 513,
        deltaHigh: 898,
        utcTimestampInMinutes:
          new Date("2021-03-28T21:00:00.000Z").getTime() / 60000,
      }),
    ]);

    test("should return complete chunk", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
      ]);
      fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
      const trendbars = await readTrendbarsChunk(
        "./EURUSD.DB",
        {
          fromTimestamp: new Date("2021-02-14T22:00:00.000Z").getTime(),
          toTimestamp: new Date("2021-04-01T00:00:00.000Z").getTime(),
        },
        ProtoOATrendbarPeriod.W1
      );
      expect(trendbars).toStrictEqual(chunk);
    });

    test("should also return complete chunk", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
      ]);
      fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
      const trendbars = await readTrendbarsChunk(
        "./EURUSD.DB",
        {
          fromTimestamp: new Date("2021-02-25T00:00:00.000Z").getTime(),
          toTimestamp: new Date("2021-04-01T00:00:00.000Z").getTime(),
        },
        ProtoOATrendbarPeriod.W1
      );
      expect(trendbars).toStrictEqual(chunk);
    });
  });
});
