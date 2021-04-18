const fs = require("fs");
const path = require("path");

const { write } = require("../../build/database/write");

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

describe("Database", () => {
  describe("write", () => {
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
      await write("./EURUSD.DB", period, tickData);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        "EURUSD.DB" +
          path.sep +
          Buffer.from(JSON.stringify(period)).toString("base64") +
          ".json",
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
      await write("./EURUSD.DB", period, tickData);
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        "EURUSD.DB" +
          path.sep +
          Buffer.from(JSON.stringify(period)).toString("base64") +
          ".json",
        "[]"
      );
    });
  });
});
