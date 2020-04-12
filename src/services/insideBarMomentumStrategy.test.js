const { insideBarMomentumStrategy } = require("../../build/services/insideBarMomentumStrategy")
const { DebugSpotPricesStream } = require("../../build/services/base/spotPrices")
const ms = require("ms");

describe("insideBarMomentumStrategy", () => {
    test("bullish pattern", async done => {
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
        const account = await insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })
        const trendbars = await account.trendbars({ period, symbol })

        let trendbarNo = 0;
        trendbars.on("trendbar", e => {
            if(trendbarNo === 0) {
                expect(e).toStrictEqual({timestamp: 1000000, open: 15000, high: 15500, low: 14980, close: 15100, volume: 0})
            } else if(trendbarNo === 1) {
                expect(e).toStrictEqual({timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0})
            } else {
                fail(new Error(`unexpected trendbar-event: ${JSON.stringify(e)}`))
            }
            trendbarNo++;
        })
        let orderNo = 0;
        account.on("order", e => {
            if(orderNo === 0) {
                expect(e).toStrictEqual({timestamp: expect.any(Number), status: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916});
            } else if(orderNo ===  1) {
                expect(e).toStrictEqual({timestamp: expect.any(Number), status: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916});
                done();
            } else {
                fail(new Error(`unexpected order-event: ${JSON.stringify(e)}`))
            }
            orderNo++;
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
    test("bearish pattern", async done => {
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
        const account = await insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })
        const trendbars = await account.trendbars({ period, symbol })

        let trendbarNo = 0;
        trendbars.on("trendbar", e => {
            if(trendbarNo === 0) {
                expect(e).toStrictEqual({timestamp: 1000000, open: 15100, high: 15500, low: 14980, close: 15000, volume: 0})
            } else if(trendbarNo === 1) {
                expect(e).toStrictEqual({timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0})
            } else {
                fail(new Error(`unexpected trendbar-event: ${JSON.stringify(e)}`))
            }
            trendbarNo++;
        })
        let orderNo = 0;
        account.on("order", e => {
            if(orderNo === 0) {
                expect(e).toStrictEqual({timestamp: expect.any(Number), status: "CREATED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564});
            } else if(orderNo === 1) {
                expect(e).toStrictEqual({timestamp: expect.any(Number), status: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564});
                done();
            } else {
                fail(new Error(`unexpected order-event: ${JSON.stringify(e)}`))
            }
            orderNo++;
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
    test("cancel previous (BUY) order", async done => {
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
        const account = await insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })
        
        const orders = {
            "1": [
                {timestamp: expect.any(Number), status: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916},
                {timestamp: expect.any(Number), status: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916},
                {timestamp: expect.any(Number), status: "CANCELED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916},
                {timestamp: expect.any(Number), status: "ENDED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916}
            ],
            "2": [
                {timestamp: expect.any(Number), status: "CREATED", id: "2", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564},
                {timestamp: expect.any(Number), status: "ACCEPTED", id: "2", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564}
            ]
        }
        account.on("order", e => {
            if(orders[e.id] && orders[e.id].length > 0) {
                expect(e).toStrictEqual(orders[e.id][0]);
                orders[e.id].shift();
                if(orders["1"].length === 0 && orders["2"].length === 0) {
                    done();
                }
            } else {
                fail(new Error(`unexpected order-event: ${JSON.stringify(e)}`))
            }
        })

        spotPrices.emitBid({ timestamp: 1000000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1000250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1000500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1000750, bid: 15100})

        spotPrices.emitBid({ timestamp: 1001000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001750, bid: 15000})

        spotPrices.emitBid({ timestamp: 1002000, bid: 15100})
        spotPrices.emitBid({ timestamp: 1002250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1002500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1002750, bid: 15000})

        spotPrices.emitBid({ timestamp: 1003000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003750, bid: 15000})

        spotPrices.emitAsk({ timestamp: 1004000, ask: 0})
    })
    test("cancel previous (SELL) order", async done => {
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
        const account = await insideBarMomentumStrategy({ currency, initialBalance, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, spots })

        const orders = {
            "1": [
                {timestamp: expect.any(Number), status: "CREATED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564},
                {timestamp: expect.any(Number), status: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564},
                {timestamp: expect.any(Number), status: "CANCELED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564},
                {timestamp: expect.any(Number), status: "ENDED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564}
            ],
            "2": [
                {timestamp: expect.any(Number), status: "CREATED", id: "2", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916},
                {timestamp: expect.any(Number), status: "ACCEPTED", id: "2", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916}
            ]
        }
        account.on("order", e => {
            if(orders[e.id] && orders[e.id].length > 0) {
                expect(e).toStrictEqual(orders[e.id][0]);
                orders[e.id].shift();
                if(orders["1"].length === 0 && orders["2"].length === 0) {
                    done();
                }
            } else {
                fail(new Error(`unexpected order-event: ${JSON.stringify(e)}`))
            }
        })

        spotPrices.emitBid({ timestamp: 1000000, bid: 15100})
        spotPrices.emitBid({ timestamp: 1000250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1000500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1000750, bid: 15000})

        spotPrices.emitBid({ timestamp: 1001000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1001750, bid: 15000})

        spotPrices.emitBid({ timestamp: 1002000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1002250, bid: 15500})
        spotPrices.emitBid({ timestamp: 1002500, bid: 14980})
        spotPrices.emitBid({ timestamp: 1002750, bid: 15100})

        spotPrices.emitBid({ timestamp: 1003000, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003250, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003500, bid: 15000})
        spotPrices.emitBid({ timestamp: 1003750, bid: 15000})

        spotPrices.emitAsk({ timestamp: 1004000, ask: 0})
    })
})