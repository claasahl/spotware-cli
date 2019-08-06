const { isValid } = require("../../build/operators/validSnapshot");
describe("isValid(snapshot)", () => {
  describe("snapshots without any trendbars", () => {
    test("empty snapshot", () => {
      expect(
        isValid({
          timestamp: 0,
          date: "1970-01-01T00:00:00.000Z"
        })
      ).toBe(true);
    });
  }),
    describe("snapshot with single d1 trendbar", () => {
      test("trendbar in (distant) future", () => {
        expect(
          isValid({
            timestamp: 1548972000000,
            date: "2019-01-31T22:00:00.000Z",
            d1: {
              volume: 2647,
              period: 12,
              low: 298040000,
              open: 301660000,
              close: 300810000,
              high: 302160000,
              timestamp: 1549058400000,
              date: "2019-02-01T22:00:00.000Z"
            }
          })
        ).toBe(false);
      }),
        test("trendbar in (near) future", () => {
          expect(
            isValid({
              timestamp: 1549058400000,
              date: "2019-02-01T22:00:00.000Z",
              d1: {
                volume: 2647,
                period: 12,
                low: 298040000,
                open: 301660000,
                close: 300810000,
                high: 302160000,
                timestamp: 1549058400000,
                date: "2019-02-01T22:00:00.000Z"
              }
            })
          ).toBe(false);
        }),
        test("trendbar is aligned", () => {
          expect(
            isValid({
              timestamp: 1549144800000,
              date: "2019-02-02T22:00:00.000Z",
              d1: {
                volume: 2647,
                period: 12,
                low: 298040000,
                open: 301660000,
                close: 300810000,
                high: 302160000,
                timestamp: 1549058400000,
                date: "2019-02-01T22:00:00.000Z"
              }
            })
          ).toBe(true);
        }),
        test("single trendbar in (distant) past", () => {
          expect(
            isValid({
              timestamp: 1549231200000,
              date: "2019-02-03T22:00:00.000Z",
              d1: {
                volume: 2647,
                period: 12,
                low: 298040000,
                open: 301660000,
                close: 300810000,
                high: 302160000,
                timestamp: 1549058400000,
                date: "2019-02-01T22:00:00.000Z"
              }
            })
          ).toBe(false);
        });
    }),
    describe("snapshot with single m3 trendbar", () => {
      test("trendbar in (near) future", () => {
        expect(
          isValid({
            timestamp: 1548986340000,
            date: "2019-02-01T01:59:00.000Z",
            m3: {
              volume: 13,
              period: 3,
              low: 296620000,
              open: 296620000,
              close: 296620000,
              high: 296620000,
              timestamp: 1548986220000,
              date: "2019-02-01T01:57:00.000Z"
            }
          })
        ).toBe(false);
      }),
        test("trendbar is aligned", () => {
          expect(
            isValid({
              timestamp: 1548986400000,
              date: "2019-02-01T02:00:00.000Z",
              m3: {
                volume: 13,
                period: 3,
                low: 296620000,
                open: 296620000,
                close: 296620000,
                high: 296620000,
                timestamp: 1548986220000,
                date: "2019-02-01T01:57:00.000Z"
              }
            })
          ).toBe(true);
        }),
        test("trendbar in (near) past", () => {
          expect(
            isValid({
              timestamp: 1548986460000,
              date: "2019-02-01T02:01:00.000Z",
              m3: {
                volume: 13,
                period: 3,
                low: 296620000,
                open: 296620000,
                close: 296620000,
                high: 296620000,
                timestamp: 1548986220000,
                date: "2019-02-01T01:57:00.000Z"
              }
            })
          ).toBe(false);
        });
    }),
    describe("snapshot with multiple trendbars", () => {
      test("trendbars are aligned", () => {
        expect(
          isValid({
            timestamp: 1549144800000,
            date: "2019-02-02T22:00:00.000Z",
            m3: {
              volume: 13,
              period: 3,
              low: 296620000,
              open: 296620000,
              close: 296620000,
              high: 296620000,
              timestamp: 1549144620000,
              date: "2019-02-02T21:57:00.000Z"
            },
            d1: {
              volume: 2647,
              period: 12,
              low: 298040000,
              open: 301660000,
              close: 300810000,
              high: 302160000,
              timestamp: 1549058400000,
              date: "2019-02-01T22:00:00.000Z"
            }
          })
        ).toBe(true);
      }),
        test("trendbar m3 is misaligned", () => {
          expect(
            isValid({
              timestamp: 1549144800000,
              date: "2019-02-02T22:00:00.000Z",
              m3: {
                volume: 13,
                period: 3,
                low: 296620000,
                open: 296620000,
                close: 296620000,
                high: 296620000,
                timestamp: 1548986220000,
                date: "2019-02-01T01:57:00.000Z"
              },
              d1: {
                volume: 2647,
                period: 12,
                low: 298040000,
                open: 301660000,
                close: 300810000,
                high: 302160000,
                timestamp: 1549058400000,
                date: "2019-02-01T22:00:00.000Z"
              }
            })
          ).toBe(false);
        }),
        test("trendbar d1 is misaligned", () => {
          expect(
            isValid({
              timestamp: 1549144800000,
              date: "2019-02-02T22:00:00.000Z",
              m3: {
                volume: 13,
                period: 3,
                low: 296620000,
                open: 296620000,
                close: 296620000,
                high: 296620000,
                timestamp: 1549144620000,
                date: "2019-02-02T21:57:00.000Z"
              },
              d1: {
                volume: 2647,
                period: 12,
                low: 298040000,
                open: 301660000,
                close: 300810000,
                high: 302160000,
                timestamp: 1548972000000,
                date: "2019-01-31T22:00:00.000Z"
              }
            })
          ).toBe(false);
        });
    });
});
