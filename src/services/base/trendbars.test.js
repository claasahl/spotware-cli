const {DebugTrendbarsStream} = require("../../../build/services/base/trendbars")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
debug.mockImplementation(() => ({ extend }))

describe("DebugTrendbarsStream", () => {
    describe("props", () => {
        test("should expose props", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            expect(stream.props).toBe(props)
        })
    
        test("should freeze props", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
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
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            new DebugTrendbarsStream(props)
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'trendbar' events", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            const event = { open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.emit("trendbar", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("should not log unknown events", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            stream.emit("unknown", {})
            stream.emit("something", {})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })

    describe("access cached events", () => {
        test("should call cb with trendbar (not cached)", done => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            const event = { open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.trendbar(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("trendbar", event), 100)
        })
    
        test("should call cb with trendbar (cached)", done => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            const event = { open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.once("trendbar", () => {
                stream.trendbar(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("trendbar", event);
        })
    })

    describe("actions", () => {
        // no actions
    })

    describe("emitXXX helpers", () => {
        test("should emit 'trendbar' event", done => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new DebugTrendbarsStream(props)
            const event = { open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            stream.once("trendbar", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitTrendbar(event)
        })
    })
})