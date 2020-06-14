const { logSpotPriceEvents } = require("../../../build/services/logging/spotPrices")
const { PassThrough } = require("stream")
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
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc") };
            logSpotPriceEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'ask' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc") };
            const event = { type: "ASK_PRICE_CHANGED", ask: 23, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'bid' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc") };
            const event = { type: "BID_PRICE_CHANGED", bid: 23, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'price' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc") };
            const event = { type: "PRICE_CHANGED", ask: 23, bid: 22, timestamp: 123 };
            logSpotPriceEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'end' events", done => {
            const stream = new PassThrough();
            logAccountEvents(stream);
            stream.resume();
            stream.end();
            finished(stream, () => {
                expect(log).toHaveBeenCalledTimes(1)
                expect(log).toHaveBeenCalledWith("ENDED");
                done();
            })
        })

        test("log 'error' events", done => {
            const stream = new PassThrough();
            logAccountEvents(stream);
            const error = new Error("something horrible happened");
            stream.destroy(error);
            finished(stream, () => {
                expect(log).toHaveBeenCalledTimes(1)
                expect(log).toHaveBeenCalledWith(error);
                done();
            })
        })

        test("should not log unknown events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc") };
            logSpotPriceEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})