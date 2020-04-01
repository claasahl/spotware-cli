const { insideBarMomentumStrategy } = require("../../build/services/insideBarMomentumStrategy")
const { DebugSpotPricesStream } = require("../../build/services/base/spotPrices")
const ms = require("ms");

describe("insideBarMomentumStrategy", () => {
    test("bullish pattern", done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new DebugSpotPricesStream({symbol})
        const spots = () => spotPrices;
        const account = insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })
        const trendbars = account.trendbars({ period, symbol })

        let trendbarNo = 0;
        trendbars.on("trendbar", e => {
            if(trendbarNo === 0) {
                expect(e).toStrictEqual({timestamp: 1000000, open: 15000, high: 15500, low: 14980, close: 15100, volume: 0})
            } else if(trendbarNo === 1) {
                expect(e).toStrictEqual({timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0})
            }
            trendbarNo++;
        })
        account.on("order", e => {
            expect(e).toStrictEqual({timestamp: expect.any(Number)});
            expect(trendbarNo).toBe(2);
            done();
        })

        spotPrices.emitBid({ timestamp: 1000000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1000250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1000500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1000750, bid: 15100})

        spotPrices.emitBid({ timestamp: 1001000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001750, bid: 15000})

        spotPrices.emitAsk({ timestamp: 1002000, ask: 0})
    })
    test("bearish pattern", done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new DebugSpotPricesStream({symbol})
        const spots = () => spotPrices;
        const account = insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })
        const trendbars = account.trendbars({ period, symbol })

        let trendbarNo = 0;
        trendbars.on("trendbar", e => {
            if(trendbarNo === 0) {
                expect(e).toStrictEqual({timestamp: 1000000, open: 15100, high: 15500, low: 14980, close: 15000, volume: 0})
            } else if(trendbarNo === 1) {
                expect(e).toStrictEqual({timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0})
            }
            trendbarNo++;
        })
        account.on("order", e => {
            expect(e).toStrictEqual({timestamp: expect.any(Number)});
            expect(trendbarNo).toBe(2);
            done();
        })

        spotPrices.emitBid({ timestamp: 1000000, bid: 15100})
        spotPrices.emitBid({ timestamp: 1000250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1000500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1000750, bid: 15000})

        spotPrices.emitBid({ timestamp: 1001000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001750, bid: 15000})

        spotPrices.emitAsk({ timestamp: 1002000, ask: 0})
    })
})