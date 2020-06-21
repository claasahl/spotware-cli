const { insideBarMomentumStrategy } = require("../../build/services/insideBarMomentumStrategy")
const { SpotPricesStream } = require("../../build/services/debug/spotPrices")
const { fromNothing } = require("../../build/services/local/account")
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
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })
        const trendbars = await account.trendbars({ period, symbol })

        const expectedTrendbarEvents = [
            { type: "TRENDBAR", timestamp: 1000000, open: 15000, high: 15500, low: 14980, close: 15100, volume: 0 },
            { type: "TRENDBAR", timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0 }
        ]
        trendbars.on("data", e => expect(e).toStrictEqual(expectedTrendbarEvents.shift()))

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined }
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15100 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002000, ask: 0 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002001, ask: 0 })
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
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })
        const trendbars = await account.trendbars({ period, symbol })

        const expectedTrendbarEvents = [
            { type: "TRENDBAR", timestamp: 1000000, open: 15100, high: 15500, low: 14980, close: 15000, volume: 0 },
            { type: "TRENDBAR", timestamp: 1001000, open: 15000, high: 15000, low: 15000, close: 15000, volume: 0 }
        ]
        trendbars.on("data", e => expect(e).toStrictEqual(expectedTrendbarEvents.shift()))

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined }
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15100 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002000, bid: 99999 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002001, bid: 99999 })
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
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1003000, type: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1003000, type: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1003000, type: "CANCELED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1003000, type: "ENDED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1003000, type: "TRANSACTION", amount: 0 },
            { timestamp: 1003000, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 1003000, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1004001, type: "CREATED", id: "2", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1004001, type: "ACCEPTED", id: "2", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined }
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15100 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002000, bid: 15100 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002750, bid: 15000 })

        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1003000, ask: 0 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1004000, bid: 99999 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1004001, bid: 99999 })
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
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002250, type: "CREATED", id: "1", symbol, enter: 14928, tradeSide: "SELL", volume: 0.1, stopLoss: 15188, takeProfit: 14564, orderType: "STOP", expiresAt: undefined },
            { timestamp: 1002250, type: "ACCEPTED", id: "1", symbol, enter: 14928, tradeSide: "SELL", volume: 0.1, stopLoss: 15188, takeProfit: 14564, orderType: "STOP", expiresAt: undefined },
            { timestamp: 1002250, type: "CANCELED", id: "1", symbol, enter: 14928, tradeSide: "SELL", volume: 0.1, stopLoss: 15188, takeProfit: 14564, orderType: "STOP", expiresAt: undefined },
            { timestamp: 1002250, type: "ENDED", id: "1", symbol, enter: 14928, tradeSide: "SELL", volume: 0.1, stopLoss: 15188, takeProfit: 14564, orderType: "STOP", expiresAt: undefined },
            { timestamp: 1002250, type: "TRANSACTION", amount: 0 },
            { timestamp: 1002250, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 1002250, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1004001, type: "CREATED", id: "2", symbol, enter: 15552, tradeSide: "BUY", volume: 0.1, stopLoss: 15292, takeProfit: 15916, orderType: "STOP", expiresAt: undefined },
            { timestamp: 1004001, type: "ACCEPTED", id: "2", symbol, enter: 15552, tradeSide: "BUY", volume: 0.1, stopLoss: 15292, takeProfit: 15916, orderType: "STOP", expiresAt: undefined },
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15100 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002750, bid: 15100 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1003750, bid: 15000 })

        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1004000, ask: 0 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1004001, ask: 0 })
    })
    test("close (BUY) order if entry price exceeds takeProfit", async done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1002001, type: "FILLED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, entry: 15552 },
            { timestamp: 1002002, type: "PROFITLOSS", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, price: 15916, profitLoss: 36.4 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 1036.4 },
            { timestamp: 1002002, type: "CLOSED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, exit: 15916, profitLoss: 36.4 },
            { timestamp: 1002002, type: "ENDED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, exit: 15916, profitLoss: 36.4 },
            { timestamp: 1002002, type: "TRANSACTION", amount: 36.4 },
            { timestamp: 1002002, type: "BALANCE_CHANGED", balance: 1036.4 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 1036.4 },
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15100 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002000, ask: 15000 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002001, ask: 15552 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002002, bid: 15916 })
    })
    test("close (SELL) order if entry price exceeds takeProfit", async done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1002001, type: "FILLED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, entry: 14928 },
            { timestamp: 1002002, type: "PROFITLOSS", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, price: 14564, profitLoss: 36.4 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 1036.4 },
            { timestamp: 1002002, type: "CLOSED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, exit: 14564, profitLoss: 36.4 },
            { timestamp: 1002002, type: "ENDED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, exit: 14564, profitLoss: 36.4 },
            { timestamp: 1002002, type: "TRANSACTION", amount: 36.4 },
            { timestamp: 1002002, type: "BALANCE_CHANGED", balance: 1036.4 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 1036.4 },
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15100 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002001, bid: 14928 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002002, ask: 14564 })
    })
    test("close (BUY) order if entry price exceeds stopLoss", async done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined },
            { timestamp: 1002001, type: "FILLED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, entry: 15552 },
            { timestamp: 1002002, type: "PROFITLOSS", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, price: 15292, profitLoss: -26 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 974 },
            { timestamp: 1002002, type: "CLOSED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, exit: 15292, profitLoss: -26 },
            { timestamp: 1002002, type: "ENDED", id: "1", symbol, tradeSide: "BUY", volume, orderType: "STOP", enter: 15552, stopLoss: 15292, takeProfit: 15916, expiresAt: undefined, exit: 15292, profitLoss: -26 },
            { timestamp: 1002002, type: "TRANSACTION", amount: -26 },
            { timestamp: 1002002, type: "BALANCE_CHANGED", balance: 974 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 974 },
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15100 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002000, ask: 15000 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002001, ask: 15552 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002002, bid: 15292 })
    })
    test("close (SELL) order if entry price exceeds stopLoss", async done => {
        const currency = Symbol.for("EUR");
        const initialBalance = 1000;
        const period = ms("1s");
        const symbol = Symbol.for("BTC/EUR");
        const enterOffset = 0.1;
        const stopLossOffset = 0.4;
        const takeProfitOffset = 0.8;
        const minTrendbarRange = 15;
        const volume = 0.1;
        const spotPrices = new SpotPricesStream({ symbol })
        const spots = () => spotPrices;
        const account = fromNothing({ currency, initialBalance, spots })
        await insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume })

        const expectedAccountEvents = [
            { timestamp: 0, type: "TRANSACTION", amount: 1000 },
            { timestamp: 0, type: "BALANCE_CHANGED", balance: 1000 },
            { timestamp: 0, type: "EQUITY_CHANGED", equity: 1000 },
            { timestamp: 1002001, type: "CREATED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1002001, type: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined },
            { timestamp: 1002001, type: "FILLED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, entry: 14928 },
            { timestamp: 1002002, type: "PROFITLOSS", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, price: 15188, profitLoss: -26 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 974 },
            { timestamp: 1002002, type: "CLOSED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, exit: 15188, profitLoss: -26 },
            { timestamp: 1002002, type: "ENDED", id: "1", symbol, tradeSide: "SELL", volume, orderType: "STOP", enter: 14928, stopLoss: 15188, takeProfit: 14564, expiresAt: undefined, exit: 15188, profitLoss: -26 },
            { timestamp: 1002002, type: "TRANSACTION", amount: -26 },
            { timestamp: 1002002, type: "BALANCE_CHANGED", balance: 974 },
            { timestamp: 1002002, type: "EQUITY_CHANGED", equity: 974 },
        ]
        account.on("data", e => {
            expect(e).toStrictEqual(expectedAccountEvents.shift());
            if (expectedAccountEvents.length === 0) {
                done();
            }
        })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000000, bid: 15100 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000250, bid: 15500 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000500, bid: 14980 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1000750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001250, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001500, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1001750, bid: 15000 })

        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002000, bid: 15000 })
        spotPrices.push({ type: "BID_PRICE_CHANGED", timestamp: 1002001, bid: 14928 })
        spotPrices.push({ type: "ASK_PRICE_CHANGED", timestamp: 1002002, ask: 15188 })
    })
})