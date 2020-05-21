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
        const event = { timestamp: expect.any(Number), amount: 500 }
        stream.on("transaction", e => {
            expect(e).toStrictEqual(event);
            done()
        })
    })
    test("'balance' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { timestamp: expect.any(Number), balance: 500 }
        stream.on("balance", e => {
            expect(e).toStrictEqual(event);
            done()
        })
    })
    test("'equity' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { timestamp: expect.any(Number), equity: 500 }
        stream.on("equity", e => {
            expect(e).toStrictEqual(event);
            done()
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
        expect(trendbars.props).toStrictEqual({ symbol, period, spots: spotPrices });
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
            let orderNo = 0;
            stream.on("order", e => {
                if(orderNo == 0) {
                    expect(e).toStrictEqual({ timestamp: 2, type: "CREATED", orderType: "MARKET", ...order });
                } else if(orderNo == 1) {
                    expect(e).toStrictEqual({ timestamp: 2, type: "ACCEPTED", orderType: "MARKET", ...order });
                    done()
                }
                orderNo++;
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
            let no = 0;
            stream.on("equity", e => {
                if(no === 1) {
                    // expect(e).toStrictEqual({ timestamp: 1, equity: 520 });
                    spotPrices.tryAsk({ timestamp: 3, ask: 12 })
                } else if(no === 2) {
                    expect(e).toStrictEqual({ timestamp: 3, equity: 512 });
                    spotPrices.tryAsk({ timestamp: 4, ask: 8 })
                } else if(no === 3) {
                    expect(e).toStrictEqual({ timestamp: 4, equity: 528 });
                    done()
                }
                no++;
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
        test("should produce 'balance' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.marketOrder({ id: "346", symbol, tradeSide: "SELL", volume: 4, takeProfit: 8 })
            let no = 0;
            stream.on("balance", e => {
                if(no === 1) {
                    expect(e).toStrictEqual({ timestamp: 4, balance: 528 });
                    done()
                }
                no++;
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
            let no = 0;
            stream.on("transaction", e => {
                if(no === 1) {
                    expect(e).toStrictEqual({ timestamp: 4, amount: 28 });
                    done()
                }
                no++;
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
            spotPrices.tryAsk({ timestamp: 3, ask: 12 })
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
            let orderNo = 0;
            stream.on("order", e => {
                if(orderNo == 0) {
                    expect(e).toStrictEqual({ timestamp: 1, type: "CREATED", orderType: "STOP", ...order });
                } else if(orderNo == 1) {
                    expect(e).toStrictEqual({ timestamp: 1, type: "ACCEPTED", orderType: "STOP", ...order });
                    done()
                }
                orderNo++;
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
            let no = 0;
            stream.on("equity", e => {
                if(no === 1) {
                    // expect(e).toStrictEqual({ timestamp: 2, equity: 520 });
                    spotPrices.tryBid({ timestamp: 3, bid: 12 })
                } else if(no === 2) {
                    expect(e).toStrictEqual({ timestamp: 3, equity: 508 });
                    spotPrices.tryBid({ timestamp: 4, bid: 18 })
                } else if(no === 3) {
                    expect(e).toStrictEqual({ timestamp: 4, equity: 532 });
                    done()
                }
                no++;
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
        test("should produce 'balance' event", done => {
            const symbol = Symbol.for("abc/def")
            const spotPrices = new DebugSpotPricesStream({ symbol })
            const currency = Symbol.for("abc")
            const spots = () => spotPrices
            const stream = fromNothing({ currency, spots, initialBalance: 500})
            stream.stopOrder({ id: "346", symbol, tradeSide: "BUY", volume: 4, enter: 3, takeProfit: 15 })
            let no = 0;
            stream.on("balance", e => {
                if(no === 1) {
                    expect(e).toStrictEqual({ timestamp: 2, balance: 520 });
                    done()
                }
                no++;
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
            let no = 0;
            stream.on("transaction", e => {
                if(no === 1) {
                    expect(e).toStrictEqual({ timestamp: 2, amount: 20 });
                    done()
                }
                no++;
            })
            spotPrices.tryAsk({ timestamp: 1, ask: 10 })
            spotPrices.tryBid({ timestamp: 2, bid: 15 })
        })
    })
})