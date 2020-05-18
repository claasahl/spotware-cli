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
            expect(extend).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'ask' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { type: "ASK_PRICE_CHANGED", ask: 23, timestamp: 123 };
            stream.tryAsk(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'bid' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { type: "BID_PRICE_CHANGED", bid: 23, timestamp: 123 };
            stream.tryBid(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'price' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { type: "PRICE_CHANGED", ask: 23, bid: 22, timestamp: 123 };
            stream.tryPrice(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
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
        test("should call cb with ask (not cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            expect(stream.ask()).resolves.toBe(event);
            setTimeout(() => stream.emit("ask", event), 100)
        })
    
        test("should call cb with ask (cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.once("ask", () => {
                expect(stream.ask()).resolves.toBe(event);
            })
            stream.emit("ask", event);
        })

        test("should call cb with bid (not cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            expect(stream.bid()).resolves.toBe(event);
            setTimeout(() => stream.emit("bid", event), 100)
        })
    
        test("should call cb with bid (cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.once("bid", () => {
                expect(stream.bid()).resolves.toBe(event);
            })
            stream.emit("bid", event);
        })

        test("should call cb with price (not cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            expect(stream.price()).resolves.toBe(event);
            setTimeout(() => stream.emit("price", event), 100)
        })
    
        test("should call cb with price (cached)", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.once("price", () => {
                expect(stream.price()).resolves.toBe(event);
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

    describe("lifecylce", () => {
        test("should emit 'ask' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.once("data", e => {
                if(e.type === "ASK_PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "ASK_PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryAsk(event)
        })

        test("should emit 'bid' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.once("data", e => {
                if(e.type === "BID_PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "BID_PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryBid(event)
        })
    
        test("should emit 'price' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryPrice(event)
        })
    })
})