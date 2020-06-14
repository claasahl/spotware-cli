const { logAccountEvents } = require("../../../build/services/logging/account")
const { PassThrough, finished } = require("stream")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
debug.mockImplementation(() => log)

describe("logging", () => {
    describe("logAccountEvents", () => {
        beforeEach(() => {
            debug.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const stream = new PassThrough();
            logAccountEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'balance' events", () => {
            const stream = new PassThrough();
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'transaction' events", () => {
            const stream = new PassThrough();
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenNthCalledWith(1, "%j", event);
        })

        test("log 'equity' events", () => {
            const stream = new PassThrough();
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'order' events", () => {
            const stream = new PassThrough();
            const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
            logAccountEvents(stream);
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
            logAccountEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})