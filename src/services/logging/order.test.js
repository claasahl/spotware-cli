const { logOrderEvents } = require("../../../build/services/logging/order")
const { PassThrough } = require("stream")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
log["extend"] = extend;
debug.mockImplementation(() => ({ extend }))

describe("logging", () => {
    describe("logOrderEvents", () => {
        beforeEach(() => {
            debug.mockClear();
            extend.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            logOrderEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(2)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'created' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "CREATED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'accepted' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "ACCEPTED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'rejected' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "REJECTED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'filled' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'profitLoss' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "PROFITLOSS", profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'closed' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'canceled' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "CANCELED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'expired' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "EXPIRED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'ended' events", () => {
            const stream = new PassThrough();
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
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
            stream.props = { symbol: Symbol.for("abc"), id: "0" };
            logOrderEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})