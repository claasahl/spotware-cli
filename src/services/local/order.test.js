const {marketOrderFromSpotPrices, stopOrderFromSpotPrices} = require("../../../build/services/local/order")
const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")

describe("marketOrderFromSpotPrices", () => {
    describe("order type: BUY", () => {
        test("accept order asap", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 1, entry: 5 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
        })
        test("fill order asap (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("ask", () => {
                const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
                const event = { timestamp: 1, entry: 5 }
                stream.on("filled", e => {
                    expect(e).toStrictEqual(event);
                    done()
                })
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
        })
        test("estimate profitLoss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 0, profitLoss: -8 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
        })
        test("estimate profitLoss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 5, profitLoss: 2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 6 })
        })
        test("take profit (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: 12, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 6 })
            spots.emitBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: 20, exit: 15 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 6 })
            spots.emitBid({ timestamp: 60, bid: 15 })
        })
        test("stop loss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: -6, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 6, bid: 2 })
        })
        test("stop loss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -8, exit: 1 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 1 })
        })
        test("'ended' event", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -8, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 1 })
        })
    })
    describe("order type: SELL", () => {
        test("accept order asap", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 1, entry: 5 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
        })
        test("fill order asap (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("bid", () => {
                const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
                const event = { timestamp: 1, entry: 5 }
                stream.on("filled", e => {
                    expect(e).toStrictEqual(event);
                    done()
                })
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
        })
        test("estimate profitLoss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 0, profitLoss: 8 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
        })
        test("estimate profitLoss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots })
            const event = { timestamp: 5, profitLoss: -2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: 6, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 8, exit: 1 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 3 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
        test("stop loss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: -14, exit: 12 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 7 })
            spots.emitAsk({ timestamp: 6, ask: 12 })
        })
        test("stop loss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: -12, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
            spots.emitAsk({ timestamp: 60, ask: 11 })
        })
        test("'ended' event", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id, symbol, tradeSide, volume, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 8, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
    })
})

describe("stopOrderFromSpotPrices", () => {
    describe("order type: BUY", () => {
        test("accept order asap", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 2, entry: 6 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitAsk({ timestamp: 2, ask: 6 })
        })
        test("fill order asap (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("ask", () => {
                const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
                const event = { timestamp: 2, entry: 6 }
                stream.on("filled", e => {
                    expect(e).toStrictEqual(event);
                    done()
                })
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitAsk({ timestamp: 2, ask: 6 })
        })
        test("estimate profitLoss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 0, profitLoss: -10 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitAsk({ timestamp: 2, ask: 6 })
        })
        test("estimate profitLoss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 5, profitLoss: 2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 7 })
        })
        test("take profit (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: 10, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 5 })
            spots.emitBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: 18, exit: 15 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 6 })
            spots.emitBid({ timestamp: 60, bid: 15 })
        })
        test("stop loss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: -8, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 6, bid: 2 })
        })
        test("stop loss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -10, exit: 1 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 1 })
        })
        test("'ended' event", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "BUY"
            const volume = 2;
            const enter = 6;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -8, exit: 2 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 2 })
        })
    })
    describe("order type: SELL", () => {
        test("accept order asap", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 1, entry: 4 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 4 })
        })
        test("fill order asap (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("bid", () => {
                const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
                const event = { timestamp: 1, entry: 4 }
                stream.on("filled", e => {
                    expect(e).toStrictEqual(event);
                    done()
                })
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 4 })
        })
        test("estimate profitLoss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 0, profitLoss: 6 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitBid({ timestamp: 2, bid: 4 })
        })
        test("estimate profitLoss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots })
            const event = { timestamp: 5, profitLoss: -4 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: 4, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 6, exit: 1 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 3 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
        test("stop loss (1)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: -16, exit: 12 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 7 })
            spots.emitAsk({ timestamp: 6, ask: 12 })
        })
        test("stop loss (2)", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: -14, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
            spots.emitAsk({ timestamp: 60, ask: 11 })
        })
        test("'ended' event", done => {
            const id = 1;
            const symbol = Symbol.for("abc")
            const tradeSide = "SELL"
            const volume = 2;
            const enter = 4;
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id, symbol, tradeSide, volume, enter, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 6, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
    })
})