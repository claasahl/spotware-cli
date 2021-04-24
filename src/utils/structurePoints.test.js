const { structurePoints } = require("../../build/utils/structurePoints");

describe("Structure Points", () => {
  test("single move up", () => {
    //   C
    //  B
    // A
    const barA = Object.freeze({
      timestamp: 100,
      open: 100,
      high: 110,
      low: 95,
      close: 108,
      volumne: 0,
    });
    const barB = Object.freeze({
      timestamp: 200,
      open: 108,
      high: 120,
      low: 103,
      close: 115,
      volumne: 0,
    });
    const barC = Object.freeze({
      timestamp: 300,
      open: 115,
      high: 130,
      low: 115,
      close: 128,
      volumne: 0,
    });
    const points = structurePoints([barA, barB, barC]);
    expect(points).toStrictEqual([
      { timestamp: 100, direction: "down", value: 95, trendbar: barA },
      { timestamp: 300, direction: "up", value: 130, trendbar: barC },
    ]);
  });

  test("single move down", () => {
    // A
    //  B
    //   C
    const barA = Object.freeze({
      timestamp: 100,
      open: 128,
      high: 130,
      low: 115,
      close: 115,
      volumne: 0,
    });
    const barB = Object.freeze({
      timestamp: 200,
      open: 115,
      high: 120,
      low: 103,
      close: 108,
      volumne: 0,
    });
    const barC = Object.freeze({
      timestamp: 300,
      open: 108,
      high: 110,
      low: 95,
      close: 100,
      volumne: 0,
    });
    const points = structurePoints([barA, barB, barC]);
    expect(points).toStrictEqual([
      { timestamp: 100, direction: "up", value: 130, trendbar: barA },
      { timestamp: 300, direction: "down", value: 95, trendbar: barC },
    ]);
  });
});
