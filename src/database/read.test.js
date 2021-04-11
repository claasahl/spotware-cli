const fs = require("fs");
const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { readPeriods, read } = require("../../build/database/read");

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe("Database", () => {
  describe("readPeriods", () => {
    const a = {
      fromTimestamp: 100,
      toTimestamp: 200,
      type: ProtoOAQuoteType.BID,
    };
    const b = {
      fromTimestamp: 400,
      toTimestamp: 800,
      type: ProtoOAQuoteType.ASK,
    };
    const c = {
      fromTimestamp: 380,
      toTimestamp: 420,
      type: ProtoOAQuoteType.BID,
    };
    test("should extract periods from file names", async () => {
      fs.promises.readdir.mockResolvedValue([
        "some_random_file.json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
      ]);
      const periods = await readPeriods("./EURUSD.DB");
      expect(periods).toStrictEqual([a, b]);
    });
    test("should sort periods", async () => {
      fs.promises.readdir.mockResolvedValue([
        Buffer.from(JSON.stringify(c)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(b)).toString("base64") + ".json",
        Buffer.from(JSON.stringify(a)).toString("base64") + ".json",
      ]);
      const periods = await readPeriods("./EURUSD.DB");
      expect(periods).toStrictEqual([a, c, b]);
    });
  });

  describe("read", () => {
    test("should read tick data from file", async () => {
      const originalTickData = [
        { timestamp: 100, tick: 3 },
        { timestamp: 200, tick: 45 },
      ];
      fs.promises.readFile.mockResolvedValue(JSON.stringify(originalTickData));
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      const tickData = await read("./EURUSD.DB", period);
      expect(tickData).toStrictEqual(originalTickData);
    });
    test("should complain if file does not contain a JSON array", async (done) => {
      fs.promises.readFile.mockResolvedValue("hello world");
      const period = {
        fromTimestamp: 100,
        toTimestamp: 200,
        type: ProtoOAQuoteType.ASK,
      };
      try {
        await read("./EURUSD.DB", period);
        done(new Error("should have failed"));
      } catch {
        done();
      }
    });
  });
});
