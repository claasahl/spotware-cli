const { fromNothing } = require("../../../build/services/local/account");
const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")

describe("fromNothing", () => {
    test("'transaction' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { type: "TRANSACTION", timestamp: expect.any(Number), amount: 500 }
        stream.on("data", e => {
            if(e.type === "TRANSACTION") {
                expect(e).toStrictEqual(event);
                done()
            }
        })
    })
    test("'balance' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { type: "BALANCE_CHANGED", timestamp: expect.any(Number), balance: 500 }
        stream.on("data", e => {
            if(e.type === "BALANCE_CHANGED") {
                expect(e).toStrictEqual(event);
                done()
            }
        })
    })
    test("'equity' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { type: "EQUITY_CHANGED", timestamp: expect.any(Number), equity: 500 }
        stream.on("data", e => {
            if(e.type === "EQUITY_CHANGED") {
                expect(e).toStrictEqual(event);
                done()
            }
        })
    })
    test("get spot prices", () => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = jest.fn(() => spotPrices)
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        expect(stream.spotPrices({ symbol })).toBeTruthy();
        expect(spots).toHaveBeenCalledWith({ symbol })
        expect(spots).toHaveBeenCalledTimes(1)
    })
    test("get trendbars", async () => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = jest.fn(() => spotPrices)
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const period = 1000;
        const trendbars = await stream.trendbars({ symbol, period });
        expect(trendbars.props).toStrictEqual({ symbol, period });
        expect(spots).toHaveBeenCalledWith({ symbol })
        expect(spots).toHaveBeenCalledTimes(1)
    })
    describe("market order", () => {
        test("should emit 'order' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500 })
            const order = {id: "346", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8}
            stream.marketOrder(order)
            const events = [
                { timestamp: 2, type: "CREATED", orderType: "MARKET", ...order },
                { timestamp: 2, type: "ACCEPTED", orderType: "MARKET", ...order }
            ]
            stream.on("data", e => {
                if(events.map(e => e.type).includes(e.type)) {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
        test("should produce 'equity' events", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.marketOrder({ id: "346", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8 })
            const events = [
                expect.anything(),
                { type: "EQUITY_CHANGED", timestamp: 1, equity: 520 },
                { type: "EQUITY_CHANGED", timestamp: 3, equity: 512 },
                { type: "EQUITY_CHANGED", timestamp: 4, equity: 528 },
                { type: "EQUITY_CHANGED", timestamp: 4, equity: 528 }
            ]
            stream.on("data", e => {
                if(e.type === "EQUITY_CHANGED") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            setImmediate(() => { // TODO needs to work without setImmediate
                spotPrices.tryBid({ timestamp: 2, bid: 15 })
                setImmediate(() => {
                    spotPrices.tryAsk({ timestamp: 3, ask: 12 })
                    setImmediate(() => {
                        spotPrices.tryAsk({ timestamp: 4, ask: 8 })
                    })
                })
            })
        })
        test("should produce 'balance' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.marketOrder({ id: "346", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8 })
            const events = [
                expect.anything(),
                { type: "BALANCE_CHANGED", timestamp: 4, balance: 528 }
            ]
            stream.on("data", e => {
                if(e.type === "BALANCE_CHANGED") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
            spotPrices.tryAsk({ timestamp: 3, ask: 12 })
            spotPrices.tryAsk({ timestamp: 4, ask: 8 })
        })
        test("should produce 'transaction' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.marketOrder({ id: "346", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8 })
            const events = [
                expect.anything(),
                { type: "TRANSACTION", timestamp: 4, amount: 28 }
            ]
            stream.on("data", e => {
                if(e.type === "TRANSACTION") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
            spotPrices.tryAsk({ timestamp: 3, ask: 12 })
            spotPrices.tryAsk({ timestamp: 4, ask: 8 })
        })
        test("complete order lifecycle", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.marketOrder({ id: "1", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8 })
            
            const expectedAccountEvents = [
                {timestamp: 0, type: "TRANSACTION", amount: 500},
                {timestamp: 0, type: "BALANCE_CHANGED", balance: 500},
                {timestamp: 0, type: "EQUITY_CHANGED", equity: 500},
                {timestamp: expect.any(Number), type: "CREATED", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8},
                {timestamp: expect.any(Number), type: "ACCEPTED", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8},
                {timestamp: expect.any(Number), type: "FILLED", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8, entry: 15},
                {timestamp: expect.any(Number), type: "PROFITLOSS", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8, price: 8, profitLoss: 28},
                {timestamp: expect.any(Number), type: "EQUITY_CHANGED", equity: 528},
                {timestamp: expect.any(Number), type: "CLOSED", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8, exit: 8, profitLoss: 28},
                {timestamp: expect.any(Number), type: "ENDED", id: "1", symbol, tradeSide: "SELL", volume: 4, orderType: "MARKET", takeProfit: 8, exit: 8, profitLoss: 28},
                {timestamp: expect.any(Number), type: "TRANSACTION", amount: 28},
                {timestamp: expect.any(Number), type: "BALANCE_CHANGED", balance: 528},
                {timestamp: expect.any(Number), type: "EQUITY_CHANGED", equity: 528},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(expectedAccountEvents.shift());
                if(expectedAccountEvents.length === 0) {
                    done();
                }
            })

            spotPrices.tryBid({ timestamp: 2, bid: 15 })
            spotPrices.tryAsk({ timestamp: 4, ask: 8 })
        })
    })
    describe("stop order", () => {
        test("should emit 'order' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500 })
            const order = { id: "346", symbol, tradeSide: "BUY", volume: 4, enter: 6, takeProfit: 18 }
            stream.stopOrder(order)
            const events = [
                { timestamp: 1, type: "CREATED", orderType: "STOP", ...order },
                { timestamp: 1, type: "ACCEPTED", orderType: "STOP", ...order }
            ]
            stream.on("data", e => {
                if(events.map(e => e.type).includes(e.type)) {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
        })
        test("should produce 'equity' events", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.stopOrder({ id: "346", symbol, tradeSide: "BUY", volume: 4, enter: 3, takeProfit: 18 })
            const events = [
                expect.anything(),
                { type: "EQUITY_CHANGED", timestamp: 2, equity: 520 },
                { type: "EQUITY_CHANGED", timestamp: 3, equity: 508 },
                { type: "EQUITY_CHANGED", timestamp: 4, equity: 532 },
                { type: "EQUITY_CHANGED", timestamp: 4, equity: 532 }
            ]
            stream.on("data", e => {
                if(e.type === "EQUITY_CHANGED") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            setImmediate(() => { // TODO needs to work without setImmediate
                spotPrices.tryBid({ timestamp: 2, bid: 15 })
                setImmediate(() => {
                    spotPrices.tryBid({ timestamp: 3, bid: 12 })
                    setImmediate(() => {
                        spotPrices.tryBid({ timestamp: 4, bid: 18 })
                    })
                })
            })
        })
        test("should produce 'balance' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.stopOrder({ id: "346", symbol, tradeSide: "BUY", volume: 4, enter: 3, takeProfit: 15 })
            const events = [
                expect.anything(),
                { type: "BALANCE_CHANGED", timestamp: 2, balance: 520 }
            ]
            stream.on("data", e => {
                if(e.type === "BALANCE_CHANGED") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
        test("should produce 'transaction' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.stopOrder({ id: "346", symbol, tradeSide: "BUY", volume: 4, enter: 3, takeProfit: 15 })
            const events = [
                expect.anything(),
                { type: "TRANSACTION", timestamp: 2, amount: 20 }
            ]
            stream.on("data", e => {
                if(e.type === "TRANSACTION") {
                    expect(e).toStrictEqual(events.shift());
                    if(events.length === 0) {
                        done()
                    }
                }
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
        test("complete order lifecyle", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.stopOrder({ id: "1", symbol, tradeSide: "BUY", volume: 4, enter: 3, takeProfit: 15 })

            const expectedAccountEvents = [
                {timestamp: 0, type: "TRANSACTION", amount: 500},
                {timestamp: 0, type: "BALANCE_CHANGED", balance: 500},
                {timestamp: 0, type: "EQUITY_CHANGED", equity: 500},
                {timestamp: expect.any(Number), type: "CREATED", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15},
                {timestamp: expect.any(Number), type: "ACCEPTED", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15},
                {timestamp: expect.any(Number), type: "FILLED", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15, entry: 10},
                {timestamp: expect.any(Number), type: "PROFITLOSS", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15, price: 15, profitLoss: 20},
                {timestamp: expect.any(Number), type: "EQUITY_CHANGED", equity: 520},
                {timestamp: expect.any(Number), type: "CLOSED", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15, exit: 15, profitLoss: 20},
                {timestamp: expect.any(Number), type: "ENDED", id: "1", symbol, tradeSide: "BUY", volume: 4, orderType: "STOP", enter: 3, takeProfit: 15, exit: 15, profitLoss: 20},
                {timestamp: expect.any(Number), type: "TRANSACTION", amount: 20},
                {timestamp: expect.any(Number), type: "BALANCE_CHANGED", balance: 520},
                {timestamp: expect.any(Number), type: "EQUITY_CHANGED", equity: 520},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(expectedAccountEvents.shift());
                if(expectedAccountEvents.length === 0) {
                    done();
                }
            })

            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
    })
})