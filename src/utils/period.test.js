const ms = require("ms");
const { period } = require("../../build/utils/period");
const { ProtoOATrendbarPeriod } = require("@claasahl/spotware-adapter");

describe("Period to millis", () => {
  test("one minute", () => {
    expect(period(ProtoOATrendbarPeriod.M1)).toBe(ms("1m"));
  });
  test("two minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M2)).toBe(ms("2m"));
  });
  test("three minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M3)).toBe(ms("3m"));
  });
  test("four minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M4)).toBe(ms("4m"));
  });
  test("five minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M5)).toBe(ms("5m"));
  });
  test("ten minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M10)).toBe(ms("10m"));
  });
  test("fifteen minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M15)).toBe(ms("15m"));
  });
  test("thirty minutes", () => {
    expect(period(ProtoOATrendbarPeriod.M30)).toBe(ms("30m"));
  });
  test("one hour", () => {
    expect(period(ProtoOATrendbarPeriod.H1)).toBe(ms("1h"));
  });
  test("four hours", () => {
    expect(period(ProtoOATrendbarPeriod.H4)).toBe(ms("4h"));
  });
  test("twelve hours", () => {
    expect(period(ProtoOATrendbarPeriod.H12)).toBe(ms("12h"));
  });
  test("one day", () => {
    expect(period(ProtoOATrendbarPeriod.D1)).toBe(ms("1d"));
  });
  test("one week", () => {
    expect(period(ProtoOATrendbarPeriod.W1)).toBe(ms("7d"));
  });
});
