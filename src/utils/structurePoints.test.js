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

  test("downward ladder", () => {
    // A
    //  B   D
    //   C/  E
    //        F

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
    const barD = Object.freeze({
      timestamp: 400,
      open: 118,
      high: 120,
      low: 105,
      close: 105,
      volumne: 0,
    });
    const barE = Object.freeze({
      timestamp: 500,
      open: 105,
      high: 110,
      low: 93,
      close: 98,
      volumne: 0,
    });
    const barF = Object.freeze({
      timestamp: 600,
      open: 98,
      high: 100,
      low: 85,
      close: 90,
      volumne: 0,
    });
    const points = structurePoints([barA, barB, barC, barD, barE, barF]);
    expect(points).toStrictEqual([
      { timestamp: 100, direction: "up", value: 130, trendbar: barA },
      { timestamp: 300, direction: "down", value: 95, trendbar: barC },
      { timestamp: 400, direction: "up", value: 120, trendbar: barD },
      { timestamp: 600, direction: "down", value: 85, trendbar: barF },
    ]);
  });
});
