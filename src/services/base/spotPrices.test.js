const {DebugSpotPricesStream} = require("../../../build/services/base/spotPrices")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
debug.mockImplementation(() => ({ extend }))

describe("DebugSpotPricesStream", () => {
    describe("props", () => {
        test("should expose props", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            expect(stream.props).toBe(props)
        })
    
        test("should freeze props", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            expect(Object.isFrozen(props)).toBe(true)
            expect(Object.isFrozen(stream.props)).toBe(true)
        })
    })

    describe("log events", () => {
        beforeEach(() => {
            debug.mockClear();
            extend.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            new DebugSpotPricesStream(props)
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(3)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'ask' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.emit("ask", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'bid' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.emit("bid", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'price' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, bid: 22, timestamp: 123 };
            stream.emit("price", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("should not log unknown events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            stream.emit("unknown", {})
            stream.emit("something", {})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })

    describe("access cached events", () => {
        test("should call cb with ask (not cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.ask(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("ask", event), 100)
        })
    
        test("should call cb with ask (cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.once("ask", () => {
                stream.ask(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("ask", event);
        })

        test("should call cb with bid (not cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.bid(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("bid", event), 100)
        })
    
        test("should call cb with bid (cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.once("bid", () => {
                stream.bid(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("bid", event);
        })

        test("should call cb with price (not cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.price(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("price", event), 100)
        })
    
        test("should call cb with price (cached)", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.once("price", () => {
                stream.price(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("price", event);
        })
    })

    describe("actions", () => {
        test("trendbars", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            expect(stream.trendbars).toThrow("not implemented")
        })
    })

    describe("emitXXX helpers", () => {
        test("should emit 'ask' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.once("ask", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitAsk(event)
        })

        test("should emit 'bid' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.once("bid", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitBid(event)
        })
    
        test("should emit 'price' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.once("price", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitPrice(event)
        })
    })
})