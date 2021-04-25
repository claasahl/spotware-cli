const {
  readQuotesChunk,
  readTrendbarsChunk,
} = require("../../../build/server/store/account");
const fs = require("fs");
const {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} = require("@claasahl/spotware-adapter");

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe("Account", () => {
  describe("readQuotesChunk", () => {
    const period = Object.freeze({
      fromTimestamp: new Date("2019-01-03T13:37:18.253Z").getTime(),
      toTimestamp: new Date("2019-01-03T13:37:21.930Z").getTime(),
    });
    const chunk = Object.freeze([
      Object.freeze({
        tick: 10,
        timestamp: new Date("2019-01-03T13:37:21.570Z").getTime(),
      }),
      Object.freeze({
        tick: 11,
        timestamp: new Date("2019-01-03T13:37:21.370Z").getTime(),
      }),
      Object.freeze({
        tick: 12,
        timestamp: new Date("2019-01-03T13:37:21.164Z").getTime(),
      }),
      Object.freeze({
        tick: 13,
        timestamp: new Date("2019-01-03T13:37:19.930Z").getTime(),
      }),
      Object.freeze({
        tick: 14,
        timestamp: new Date("2019-01-03T13:37:18.253Z").getTime(),
      }),
    ]);
    const chunkCompressed = Object.freeze([
      Object.freeze({
        tick: 10,
        timestamp: new Date("2019-01-03T13:37:21.570Z").getTime(),
      }),
      Object.freeze({ tick: 1, timestamp: -200 }),
      Object.freeze({ tick: 1, timestamp: -206 }),
      Object.freeze({ tick: 1, timestamp: -1234 }),
      Object.freeze({ tick: 1, timestamp: -1677 }),
    ]);

    test("should return complete chunk", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
      ]);
      fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
      const tickData = await readQuotesChunk(
        "./EURUSD.DB",
        {
          fromTimestamp: new Date("2019-01-03T13:37:18.253Z").getTime(),
          toTimestamp: new Date("2019-01-03T13:37:21.930Z").getTime(),
        },
        ProtoOAQuoteType.ASK
      );
      expect(tickData).toStrictEqual(chunkCompressed);
    });

    describe("should return single tick", () => {
      test("fromTimestamp matches timestamp", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const tickData = await readQuotesChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2019-01-03T13:37:21.370Z").getTime(),
            toTimestamp: new Date("2019-01-03T13:37:21.371Z").getTime(),
          },
          ProtoOAQuoteType.ASK
        );
        expect(tickData).toStrictEqual([chunk[1]]);
      });
      test("toTimestamp matches timestamp", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const tickData = await readQuotesChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2019-01-03T13:37:21.000Z").getTime(),
            toTimestamp: new Date("2019-01-03T13:37:21.370Z").getTime(),
          },
          ProtoOAQuoteType.ASK
        );
        expect(tickData).toStrictEqual([chunk[2]]);
      });
      test("fromTimestamp and toTimestamp wrap timestamp", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const tickData = await readQuotesChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2019-01-03T13:37:21.000Z").getTime(),
            toTimestamp: new Date("2019-01-03T13:37:21.200Z").getTime(),
          },
          ProtoOAQuoteType.ASK
        );
        expect(tickData).toStrictEqual([chunk[2]]);
      });
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

    describe("should return single trendbar", () => {
      test("fromTimestamp matches utcTimestamp", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const trendbars = await readTrendbarsChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2021-03-07T22:00:00.000Z").getTime(),
            toTimestamp: new Date("2021-03-07T23:00:00.000Z").getTime(),
          },
          ProtoOATrendbarPeriod.W1
        );
        expect(trendbars).toStrictEqual([chunk[2]]);
      });
      test("toTimestamp matches utcTimestamp", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const trendbars = await readTrendbarsChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2021-03-07T07:00:00.000Z").getTime(),
            toTimestamp: new Date("2021-03-07T22:00:00.000Z").getTime(),
          },
          ProtoOATrendbarPeriod.W1
        );
        expect(trendbars).toStrictEqual([chunk[1], chunk[2]]);
      });
      test("fromTimestamp and toTimestamp are 'within' trendbar", async () => {
        fs.promises.readdir.mockResolvedValue([
          Buffer.from(JSON.stringify(period)).toString("base64") + ".json",
        ]);
        fs.promises.readFile.mockResolvedValue(JSON.stringify(chunk));
        const trendbars = await readTrendbarsChunk(
          "./EURUSD.DB",
          {
            fromTimestamp: new Date("2021-03-12T14:00:00.000Z").getTime(),
            toTimestamp: new Date("2021-03-12T15:00:00.000Z").getTime(),
          },
          ProtoOATrendbarPeriod.W1
        );
        expect(trendbars).toStrictEqual([chunk[2]]);
      });
    });
  });
});
