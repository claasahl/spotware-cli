const {DebugSpotPricesStream} = require("../../../build/services/base/spotPrices")
const {trendbarsFromSpotPrices} = require("../../../build/services/local/trendbars")

describe("trendbarsFromSpotPrices", () => {
    describe("period: 1sec", () => {
        test("trendbar", done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new DebugSpotPricesStream({symbol})
            const stream = trendbarsFromSpotPrices({symbol, period, spots})
            const event = {timestamp: 0, open: 1, high: 2, low: 0.5, close: 0.7, volume: 0};
            stream.on("trendbar", e => {
                expect(e).toStrictEqual(event)
                done()
            })

            spots.emitBid({timestamp: 0, bid: 1})
            spots.emitBid({timestamp: 500, bid: 2})
            spots.emitBid({timestamp: 600, bid: 0.5})
            spots.emitBid({timestamp: 999, bid: 0.7})
            spots.emitBid({timestamp: 1000, bid: 10})
        })
    })
})