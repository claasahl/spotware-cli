const { TrendbarsStream } = require("../../../build/services/debug/trendbars")
const { logTrendbarEvents } = require("../../../build/services/logging/trendbars")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
log["extend"] = extend;
debug.mockImplementation(() => ({ extend }))

describe("logging", () => {
    describe("logTrendbarEvents", () => {
        beforeEach(() => {
            debug.mockClear();
            extend.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new TrendbarsStream(props)
            logTrendbarEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(2)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'trendbar' events", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new TrendbarsStream(props)
            const event = { type: "TRENDBAR", open: 1, high: 5, low: 1, close: 2, volumne: 0, timestamp: 123 };
            logTrendbarEvents(stream); 
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 }
            const stream = new TrendbarsStream(props)
            logTrendbarEvents(stream); 
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})