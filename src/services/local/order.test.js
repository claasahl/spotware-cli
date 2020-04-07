const {marketOrderFromSpotPrices, stopOrderFromSpotPrices} = require("../../../build/services/local/order")
const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")

describe("marketOrderFromSpotPrices", () => {
    describe("actions", () => {
        test("should cancel order", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            stream.on("accepted", () => {
                stream.cancel();
            })
            stream.on("canceled", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                stream.on("ended", e => {
                    expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                    done();
                })
            })
        })
        test("should close order", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            stream.on("filled", () => {
                stream.close();
            })
            stream.on("closed", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 1, profitLoss: 8})
                stream.on("ended", e => {
                    expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 1, profitLoss: 8})
                    done();
                })
            })
            spots.emitBid({ timestamp: 0, bid: 5 })
            spots.emitAsk({ timestamp: 1, ask: 1 })
        })
        test("should 'end' order (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            stream.on("accepted", () => {
                stream.end();
            })
            stream.on("canceled", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                done();
            })
        })
        test("should 'end' order (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            stream.on("filled", () => {
                stream.end();
            })
            stream.on("closed", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 1, profitLoss: -8})
                done();
            })
            spots.emitAsk({ timestamp: 0, ask: 5 })
            spots.emitBid({ timestamp: 1, bid: 1 })
        })
    })

    describe("order type: BUY", () => {
        test("accept order asap", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { timestamp: 1, entry: 5 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("ask", () => {
                const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { timestamp: 0, price: 1, profitLoss: -8 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
        })
        test("estimate profitLoss (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { timestamp: 5, price: 6, profitLoss: 2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 6 })
        })
        test("take profit (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: 12, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                spots.emitBid({ timestamp: 7, bid: 12 })
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 6 })
            spots.emitBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -8, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                spots.emitBid({ timestamp: 61, bid: 0.5 })
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 1 })
        })
    })
    describe("order type: SELL", () => {
        test("accept order asap", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { timestamp: 1, entry: 5 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")

            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("bid", () => {
                const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { timestamp: 0, price: 1, profitLoss: 8 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
        })
        test("estimate profitLoss (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { timestamp: 5, price: 6, profitLoss: -2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: 6, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                spots.emitAsk({ timestamp: 7, ask: 1 })
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 8, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                spots.emitAsk({ timestamp: 61, ask: 0.5 })
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
    })
})

describe("stopOrderFromSpotPrices", () => {
    describe("actions", () => {
        test("should cancel order", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 6, spots })
            stream.on("accepted", () => {
                stream.cancel();
            })
            stream.on("canceled", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                stream.on("ended", e => {
                    expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                    done();
                })
            })
        })
        test("should close order", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4.5, spots })
            stream.on("filled", () => {
                stream.close();
            })
            stream.on("closed", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 2, profitLoss: 4})
                stream.on("ended", e => {
                    expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 2, profitLoss: 4})
                    done();
                })
            })
            spots.emitBid({ timestamp: 0, bid: 5 })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 2, ask: 2 })
        })
        test("should 'end' order (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            stream.on("accepted", () => {
                stream.end();
            })
            stream.on("canceled", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number)})
                done();
            })
        })
        test("should 'end' order (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            stream.on("filled", () => {
                stream.end();
            })
            stream.on("closed", e => {
                expect(e).toStrictEqual({timestamp: expect.anything(Number), exit: 10, profitLoss: 6})
                done();
            })
            spots.emitAsk({ timestamp: 0, ask: 5 })
            spots.emitAsk({ timestamp: 1, ask: 7 })
            spots.emitBid({ timestamp: 2, bid: 10 })
        })
    })

    describe("order type: BUY", () => {
        test("accept order asap", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("ask", () => {
                const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = { timestamp: 0, price: 1, profitLoss: -10 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 0, bid: 1 })
            spots.emitAsk({ timestamp: 1, ask: 5 })
            spots.emitAsk({ timestamp: 2, ask: 6 })
        })
        test("estimate profitLoss (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = { timestamp: 5, price: 7, profitLoss: 2 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 7 })
        })
        test("take profit (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 6, profitLoss: 10, exit: 11 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                spots.emitBid({ timestamp: 7, bid: 12 })
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 5 })
            spots.emitBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { timestamp: 60, profitLoss: -8, exit: 2 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                spots.emitBid({ timestamp: 61, bid: 0.5 })
                done()
            })
            spots.emitAsk({ timestamp: 1, ask: 6 })
            spots.emitBid({ timestamp: 5, bid: 4 })
            spots.emitBid({ timestamp: 60, bid: 2 })
        })
    })
    describe("order type: SELL", () => {
        test("accept order asap", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            stream.on("accepted", e => {
                expect(e).toBeTruthy()
                done()
            })
        })
        test("fill order asap (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { timestamp: 1, entry: 4 }
            stream.on("filled", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 4 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("bid", () => {
                const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { timestamp: 0, price: 1, profitLoss: 6 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitAsk({ timestamp: 0, ask: 1 })
            spots.emitBid({ timestamp: 1, bid: 5 })
            spots.emitBid({ timestamp: 2, bid: 4 })
        })
        test("estimate profitLoss (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { timestamp: 5, price: 6, profitLoss: -4 }
            stream.on("profitLoss", e => {
                expect(e).toStrictEqual(event);
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 6, profitLoss: 4, exit: 2 }
            stream.on("closed", e => {
                expect(e).toStrictEqual(event);
                spots.emitAsk({ timestamp: 7, ask: 1 })
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
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
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = stopOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { timestamp: 60, profitLoss: 6, exit: 1 }
            stream.on("ended", e => {
                expect(e).toStrictEqual(event);
                spots.emitAsk({ timestamp: 61, ask: 0.5 })
                done()
            })
            spots.emitBid({ timestamp: 1, bid: 4 })
            spots.emitAsk({ timestamp: 5, ask: 4 })
            spots.emitAsk({ timestamp: 60, ask: 1 })
        })
    })
})