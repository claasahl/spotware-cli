const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")
const { trendbarsFromSpotPrices } = require("../../../build/services/local/trendbars")

describe("trendbarsFromSpotPrices", () => {
    describe("period: 1sec", () => {
        test("trendbar based on multiple price changes", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await trendbarsFromSpotPrices({ symbol, period, spots })
            const event = { timestamp: 0, open: 1, high: 5, low: 0.1, close: 0.7, volume: 0 };
            stream.on("trendbar", e => {
                expect(e).toStrictEqual(event)
                done()
            })

            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryBid({ timestamp: 100, bid: 2 })
            spots.tryBid({ timestamp: 200, bid: 0.5 })
            spots.tryBid({ timestamp: 399, bid: 0.7 })
            spots.tryBid({ timestamp: 400, bid: 0.1 })
            spots.tryAsk({ timestamp: 400, ask: 10 })
            spots.tryAsk({ timestamp: 400, ask: 0 })
            spots.tryBid({ timestamp: 500, bid: 5.0 })
            spots.tryBid({ timestamp: 999, bid: 0.7 })
            spots.tryBid({ timestamp: 1000, bid: 10 })
        })
        test("trendbar based on single price change (1)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await trendbarsFromSpotPrices({ symbol, period, spots })
            const event = { timestamp: 0, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("trendbar", e => {
                expect(e).toStrictEqual(event)
                done()
            })

            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryBid({ timestamp: 1000, bid: 10 })
        })
        test("trendbar based on single price change (2)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await trendbarsFromSpotPrices({ symbol, period, spots })
            const event = { timestamp: 0, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("trendbar", e => {
                expect(e).toStrictEqual(event)
                done()
            })

            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1000, ask: 10 })
        })
        test("no trendbar based on single price change (3)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await trendbarsFromSpotPrices({ symbol, period, spots })
            const event = { timestamp: 1000, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("trendbar", e => {
                expect(e).toStrictEqual(event)
                done()
            })
            
            spots.tryAsk({ timestamp: 0, ask: 10 })
            spots.tryBid({ timestamp: 1000, bid: 1 })
            spots.tryAsk({ timestamp: 2000, ask: 10 })
        })
    })
})