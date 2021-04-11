const fs = require("fs");
const { ProtoOAQuoteType } = require("@claasahl/spotware-adapter");

const { readPeriods } = require("../../build/database/read");

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
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
});
