const {ToTrendbars, toTrendbars} = require("../../../build/services/generic/trendbars")
const {SpotPricesStream} = require("../../../build/services/debug/spotPrices")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
log["extend"] = extend;
debug.mockImplementation(() => ({ extend }))

describe("ToTrendbars class", () => {
    describe("props", () => {
        test("should expose props", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 };
            const stream = new ToTrendbars(props)
            expect(stream.props).toStrictEqual(props)
        })
        
        test("should freeze props", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 };
            const stream = new ToTrendbars(props)
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
            const symbol = Symbol.for("abc");
            const period = 60000;
            new ToTrendbars({ symbol, period })
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(2)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'trendbar' events", () => {
            const symbol = Symbol.for("abc");
            const period = 60000;
            const stream = new ToTrendbars({ symbol, period })
            const event = { type: "TRENDBAR", open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const symbol = Symbol.for("abc");
            const period = 60000;
            const stream = new ToTrendbars({ symbol, period })
            stream.push({ type: "UNKNOWN"})
            stream.push({something: 23})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })

    describe.skip("access cached events", () => {
        test("TRENDBAR (not cached)", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = toTrendbars(props)
            expect(stream.trendbarOrNull()).toBeNull();
        })
    
        test("TRENDBAR (cached)", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = toTrendbars(props)
            const event = { type: "TRENDBAR", open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.push(event);
            expect(stream.trendbarOrNull()).toStrictEqual(event);
        })
    })

    describe("actions", () => {
        // no actions
    })

    describe.skip("emitXXX helpers", () => {
        test("should emit 'trendbar' event", done => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = toTrendbars(props)
            const event = { type: "TRENDBAR", open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "TRENDBAR") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            stream.tryTrendbar(event)
        })
    })
})

describe("toTrendbars function", () => {
    describe("period: 1sec", () => {
        test("trendbar based on multiple price changes", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new SpotPricesStream({ symbol })
            const stream = await toTrendbars({ symbol, period, spots })
            const event = { type: "TRENDBAR", timestamp: 0, open: 1, high: 5, low: 0.1, close: 0.7, volume: 0 };
            stream.on("data", e => {
                if(e.type === "TRENDBAR") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })

            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 0, bid: 1 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 100, bid: 2 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 200, bid: 0.5 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 399, bid: 0.7 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 400, bid: 0.1 })
            spots.push({ type: "ASK_PRICE_CHANGED", timestamp: 400, ask: 10 })
            spots.push({ type: "ASK_PRICE_CHANGED", timestamp: 400, ask: 0 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 500, bid: 5.0 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 999, bid: 0.7 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 1000, bid: 10 })
        })
        test("trendbar based on single price change (1)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new SpotPricesStream({ symbol })
            const stream = await toTrendbars({ symbol, period, spots })
            const event = { type: "TRENDBAR", timestamp: 0, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("data", e => {
                if(e.type === "TRENDBAR") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })

            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 0, bid: 1 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 1000, bid: 10 })
        })
        test("trendbar based on single price change (2)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new SpotPricesStream({ symbol })
            const stream = await toTrendbars({ symbol, period, spots })
            const event = { type: "TRENDBAR", timestamp: 0, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("data", e => {
                if(e.type === "TRENDBAR") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })

            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 0, bid: 1 })
            spots.push({ type: "ASK_PRICE_CHANGED", timestamp: 1000, ask: 10 })
        })
        test("no trendbar based on single price change (3)", async done => {
            const symbol = Symbol.for("abc");
            const period = 1000;
            const spots = new SpotPricesStream({ symbol })
            const stream = await toTrendbars({ symbol, period, spots })
            const event = { type: "TRENDBAR", timestamp: 1000, open: 1, high: 1, low: 1, close: 1, volume: 0 };
            stream.on("data", e => {
                if(e.type === "TRENDBAR") {
                    expect(e).toStrictEqual(event)
                    done()
                }
            })
            
            spots.push({ type: "ASK_PRICE_CHANGED", timestamp: 0, ask: 10 })
            spots.push({ type: "BID_PRICE_CHANGED", timestamp: 1000, bid: 1 })
            spots.push({ type: "ASK_PRICE_CHANGED", timestamp: 2000, ask: 10 })
        })
    })
})