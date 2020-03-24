const { ProtoOATrendbarPeriod } = require("@claasahl/spotware-adapter");
const { periodToMillis } = require("../../build/utils/periods");

const MIN = 60000;
const HOUR = MIN * 60;
describe("", () => {
  test("M1", () => {
    const millis = periodToMillis(ProtoOATrendbarPeriod.M1);
    expect(millis).toBe(MIN);
  }),
    test("M2", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M2);
      expect(millis).toBe(MIN * 2);
    }),
    test("M3", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M3);
      expect(millis).toBe(MIN * 3);
    }),
    test("M4", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M4);
      expect(millis).toBe(MIN * 4);
    }),
    test("M5", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M5);
      expect(millis).toBe(MIN * 5);
    }),
    test("M10", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M10);
      expect(millis).toBe(MIN * 10);
    }),
    test("M15", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M15);
      expect(millis).toBe(MIN * 15);
    }),
    test("M30", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.M30);
      expect(millis).toBe(MIN * 30);
    }),
    test("H1", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.H1);
      expect(millis).toBe(HOUR);
    }),
    test("H4", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.H4);
      expect(millis).toBe(HOUR * 4);
    }),
    test("H12", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.H12);
      expect(millis).toBe(HOUR * 12);
    }),
    test("D1", () => {
      const millis = periodToMillis(ProtoOATrendbarPeriod.D1);
      expect(millis).toBe(HOUR * 24);
    }),
    test("MN1", () => {
      expect(() => {
        periodToMillis(ProtoOATrendbarPeriod.MN1);
      }).toThrow();
    });
});
