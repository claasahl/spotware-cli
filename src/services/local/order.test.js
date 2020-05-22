const {marketOrderFromSpotPrices, stopOrderFromSpotPrices} = require("../../../build/services/local/order")
const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")

describe("marketOrderFromSpotPrices", () => {
    describe("actions", () => {
        test("should cancel order", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = {timestamp: 1};
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(stream.cancel()).resolves.toStrictEqual({...event, type: "CANCELED"})
                } else if(e.type === "CANCELED") {
                    expect(e).toStrictEqual({...event, type: "CANCELED"})
                } else if(e.type === "ENDED") {
                    expect(e).toStrictEqual({...event, type: "ENDED"})
                    done();
                }
            })
            spots.tryBid({ timestamp: 1, bid: 0 })
        })
        test("should cancel order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    stream.cancel()
                    stream.cancel()
                } else if(e.type === "CANCELED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryBid({ timestamp: 1, bid: 0 })
        })
        test("should close order", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = {timestamp: 1, exit: 1, profitLoss: 8};
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(stream.close()).resolves.toStrictEqual({...event, type: "CLOSED"})
                } else if(e.type === "CLOSED") {
                    expect(e).toStrictEqual({...event, type: "CLOSED"})
                } else if(e.type === "ENDED") {
                    expect(e).toStrictEqual({...event, type: "ENDED"})
                    done();
                }
            })
            spots.tryBid({ timestamp: 0, bid: 5 })
            spots.tryAsk({ timestamp: 1, ask: 1 })
        })
        test("should close order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    stream.close()
                    stream.close()
                } else if(e.type === "CLOSED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryBid({ timestamp: 0, bid: 5 })
            spots.tryAsk({ timestamp: 1, ask: 1 })
        })
        test("should 'end' order (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = {timestamp: 1};
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(stream.end()).resolves.toStrictEqual({...event, type: "ENDED"})
                } else if(e.type === "CANCELED") {
                    expect(e).toStrictEqual({...event, type: "CANCELED"})
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 0 })
        })
        test("should 'end' order (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = {timestamp: 1, exit: 1, profitLoss: -8};
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(stream.end()).resolves.toStrictEqual({...event, type: "ENDED"})
                } else if(e.type === "CLOSED") {
                    expect(e).toStrictEqual({...event, type: "CLOSED"})
                    done();
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 5 })
            spots.tryBid({ timestamp: 1, bid: 1 })
        })
        test("should 'end' order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    stream.end()
                    stream.end()
                } else if(e.type === "ENDED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 5 })
            spots.tryBid({ timestamp: 1, bid: 1 })
        })
    })

    describe("order type: BUY", () => {
        test("create order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = {type: "CREATED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "CREATED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({timestamp: 1, ask: 0})
        })
        test("accept order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = {type: "ACCEPTED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({timestamp: 1, ask: 0})
        })
        test("fill order asap (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { type: "FILLED", timestamp: 1, entry: 5 }
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 5 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("data", async e => {
                if(e.type === "ASK_PRICE_CHANGED") {
                    const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
                    const event = { type: "FILLED", timestamp: 1, entry: 5 }
                    stream.on("data", e => {
                        if(e.type === "FILLED") {
                            expect(e).toStrictEqual(event);
                            done();
                        }
                    })
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 5 })
        })
        test("estimate profitLoss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { type: "PROFITLOSS", timestamp: 0, price: 1, profitLoss: -8 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done();
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 5 })
        })
        test("estimate profitLoss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots })
            const event = { type: "PROFITLOSS", timestamp: 5, price: 6, profitLoss: 2 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 6 })
        })
        test("take profit (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: 12, exit: 11 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 6 })
            spots.tryBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: 20, exit: 15 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 6 })
            spots.tryBid({ timestamp: 60, bid: 15 })
        })
        test("stop loss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: -6, exit: 2 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 6, bid: 2 })
        })
        test("stop loss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: -8, exit: 1 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 60, bid: 1 })
        })
        test("'ended' event", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "ENDED", timestamp: 60, profitLoss: -8, exit: 1 }
            stream.on("data", e => {
                if(e.type === "ENDED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 60, bid: 1 })
        })
    })
    describe("order type: SELL", () => {
        test("create order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = {type: "CREATED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "CREATED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({timestamp: 1, bid: 0})
        })
        test("accept order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { type: "ACCEPTED", timestamp: 1 }
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })
            spots.tryBid({timestamp: 1, bid: 0})
        })
        test("fill order asap (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { type: "FILLED", timestamp: 1, entry: 5 }
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 5 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("data", async e => {
                if(e.type === "BID_PRICE_CHANGED") {
                    const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
                    const event = { type: "FILLED", timestamp: 1, entry: 5 }
                    stream.on("data", e => {
                        if(e.type === "FILLED") {
                            expect(e).toStrictEqual(event);
                            done()
                        }
                    })
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 5 })
        })
        test("estimate profitLoss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { type: "PROFITLOSS", timestamp: 0, price: 1, profitLoss: 8 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 5 })
        })
        test("estimate profitLoss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots })
            const event = { type: "PROFITLOSS", timestamp: 5, price: 6, profitLoss: -2 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: 6, exit: 2 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 4 })
            spots.tryAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: 8, exit: 1 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 3 })
            spots.tryAsk({ timestamp: 60, ask: 1 })
        })
        test("stop loss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: -14, exit: 12 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 7 })
            spots.tryAsk({ timestamp: 6, ask: 12 })
        })
        test("stop loss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: -12, exit: 11 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 6 })
            spots.tryAsk({ timestamp: 60, ask: 11 })
        })
        test("'ended' event", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await marketOrderFromSpotPrices({ id: 1, symbol, tradeSide: "SELL", volume: 2, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "ENDED", timestamp: 60, profitLoss: 8, exit: 1 }
            stream.on("data", e => {
                if(e.type === "ENDED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryAsk({ timestamp: 5, ask: 4 })
            spots.tryAsk({ timestamp: 60, ask: 1 })
        })
    })
})

describe("stopOrderFromSpotPrices", () => {
    describe("actions", () => {
        test("should cancel order", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 6, spots })
            const event = {timestamp: 1};
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(stream.cancel()).resolves.toStrictEqual({...event, type: "CANCELED"})
                } else if(e.type === "CANCELED") {
                    expect(e).toStrictEqual({...event, type: "CANCELED"})
                } else if(e.type === "ENDED") {
                    expect(e).toStrictEqual({...event, type: "ENDED"})
                    done();
                }
            })
            spots.tryBid({ timestamp: 1, bid: 7 })
        })
        test("should cancel order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 6, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    stream.cancel()
                    stream.cancel()
                } else if(e.type === "CANCELED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryBid({ timestamp: 1, bid: 7 })
        })
        test("should close order", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4.5, spots })
            const event = {timestamp: 2, exit: 2, profitLoss: 4};
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(stream.close()).resolves.toStrictEqual({...event, type: "CLOSED"})
                } else if(e.type === "CLOSED") {
                    expect(e).toStrictEqual({...event, type: "CLOSED"})
                } else if(e.type === "ENDED") {
                    expect(e).toStrictEqual({...event, type: "ENDED"})
                    done();
                }
            })
            spots.tryBid({ timestamp: 0, bid: 5 })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 2, ask: 2 })
        })
        test("should close order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4.5, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    stream.close()
                    stream.close()
                } else if(e.type === "CLOSED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryBid({ timestamp: 0, bid: 5 })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 2, ask: 2 })
        })
        test("should 'end' order (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = {timestamp: 1};
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(stream.end()).resolves.toStrictEqual({...event, type: "ENDED"})
                } else if(e.type === "CANCELED") {
                    expect(e).toStrictEqual({...event, type: "CANCELED"})
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 5 })
        })
        test("should 'end' order (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = {timestamp: 2, exit: 10, profitLoss: 6};
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(stream.end()).resolves.toStrictEqual({...event, type: "ENDED"})
                } else if(e.type === "CLOSED") {
                    expect(e).toStrictEqual({...event, type: "CLOSED"})
                    done();
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 7 })
            spots.tryBid({ timestamp: 2, bid: 10 })
        })
        test("should 'end' order exactly once", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            let timer = undefined;
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    stream.end()
                    stream.end()
                } else if(e.type === "ENDED") {
                    expect(timer).toBeUndefined();
                    timer = setTimeout(done, 50)
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 7 })
            spots.tryBid({ timestamp: 2, bid: 10 })
        })
    })

    describe("order type: BUY", () => {
        test("create order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = {type: "CREATED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "CREATED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({timestamp: 1, ask: 0})
        })
        test("accept order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = {type: "ACCEPTED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })
            spots.tryAsk({timestamp: 1, ask: 0})
        })
        test("fill order asap (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = { type: "FILLED", timestamp: 1, entry: 6 }
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 6 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("data", async e => {
                if(e.type === "ASK_PRICE_CHANGED") {
                    const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
                    const event = { type: "FILLED", timestamp: 1, entry: 6 }
                    stream.on("data", e => {
                        if(e.type === "FILLED") {
                            expect(e).toStrictEqual(event);
                            done()
                        }
                    })
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 6 })
        })
        test("estimate profitLoss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = { type: "PROFITLOSS", timestamp: 0, price: 1, profitLoss: -10 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 0, bid: 1 })
            spots.tryAsk({ timestamp: 1, ask: 5 })
            spots.tryAsk({ timestamp: 2, ask: 6 })
        })
        test("estimate profitLoss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots })
            const event = { type: "PROFITLOSS", timestamp: 5, price: 7, profitLoss: 2 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 7 })
        })
        test("take profit (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: 10, exit: 11 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 5 })
            spots.tryBid({ timestamp: 6, bid: 11 })
        })
        test("take profit (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: 18, exit: 15 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 6 })
            spots.tryBid({ timestamp: 60, bid: 15 })
        })
        test("stop loss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: -8, exit: 2 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 6, bid: 2 })
        })
        test("stop loss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: -10, exit: 1 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 60, bid: 1 })
        })
        test("'ended' event", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "BUY", volume: 2, enter: 6, spots, takeProfit: 11, stopLoss: 2 })
            const event = { type: "ENDED", timestamp: 60, profitLoss: -8, exit: 2 }
            stream.on("data", e => {
                if(e.type === "ENDED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 1, ask: 6 })
            spots.tryBid({ timestamp: 5, bid: 4 })
            spots.tryBid({ timestamp: 60, bid: 2 })
        })
    })
    describe("order type: SELL", () => {
        test("create order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = {type: "CREATED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "CREATED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({timestamp: 1, bid: 0})
        })
        test("accept order asap", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = {type: "ACCEPTED", timestamp: 1}
            stream.on("data", e => {
                if(e.type === "ACCEPTED") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })
            spots.tryBid({timestamp: 1, bid: 0})
        })
        test("fill order asap (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { type: "FILLED", timestamp: 1, entry: 4 }
            stream.on("data", e => {
                if(e.type === "FILLED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 4 })
        })
        test("fill order asap (2)", done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            spots.on("data", async e => {
                if(e.type === "BID_PRICE_CHANGED") {
                    const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
                    const event = { type: "FILLED", timestamp: 1, entry: 4 }
                    stream.on("data", e => {
                        if(e.type === "FILLED") {
                            expect(e).toStrictEqual(event);
                            done()
                        }
                    })
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 4 })
        })
        test("estimate profitLoss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { type: "PROFITLOSS", timestamp: 0, price: 1, profitLoss: 6 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryAsk({ timestamp: 0, ask: 1 })
            spots.tryBid({ timestamp: 1, bid: 5 })
            spots.tryBid({ timestamp: 2, bid: 4 })
        })
        test("estimate profitLoss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots })
            const event = { type: "PROFITLOSS", timestamp: 5, price: 6, profitLoss: -4 }
            stream.on("data", e => {
                if(e.type === "PROFITLOSS") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 6 })
        })
        test("take profit (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: 4, exit: 2 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 4 })
            spots.tryAsk({ timestamp: 6, ask: 2 })
        })
        test("take profit (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: 6, exit: 1 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 3 })
            spots.tryAsk({ timestamp: 60, ask: 1 })
        })
        test("stop loss (1)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 6, profitLoss: -16, exit: 12 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 7 })
            spots.tryAsk({ timestamp: 6, ask: 12 })
        })
        test("stop loss (2)", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "CLOSED", timestamp: 60, profitLoss: -14, exit: 11 }
            stream.on("data", e => {
                if(e.type === "CLOSED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 6 })
            spots.tryAsk({ timestamp: 60, ask: 11 })
        })
        test("'ended' event", async done => {
            const symbol = Symbol.for("abc")
            const spots = new DebugSpotPricesStream({ symbol })
            const stream = await stopOrderFromSpotPrices({ id: "1", symbol, tradeSide: "SELL", volume: 2, enter: 4, spots, takeProfit: 2, stopLoss: 11 })
            const event = { type: "ENDED", timestamp: 60, profitLoss: 6, exit: 1 }
            stream.on("data", e => {
                if(e.type === "ENDED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            spots.tryBid({ timestamp: 1, bid: 4 })
            spots.tryAsk({ timestamp: 5, ask: 4 })
            spots.tryAsk({ timestamp: 60, ask: 1 })
        })
    })
})
