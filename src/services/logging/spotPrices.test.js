const { SpotPricesStream } = require("../../../build/services/debug/spotPrices")
const { logSpotPriceEvents } = require("../../../build/services/logging/spotPrices")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
debug.mockImplementation(() => ({ extend }))

describe("logging", () => {
    describe("logSpotPriceEvents", () => {
        beforeEach(() => {
            debug.mockClear();
            extend.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new SpotPricesStream(props)
            logSpotPriceEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'ask' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new SpotPricesStream(props)
            const event = { type: "ASK_PRICE_CHANGED", ask: 23, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'bid' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new SpotPricesStream(props)
            const event = { type: "BID_PRICE_CHANGED", bid: 23, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'price' events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new SpotPricesStream(props)
            const event = { type: "PRICE_CHANGED", ask: 23, bid: 22, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new SpotPricesStream(props)
            logSpotPriceEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})