const { OrderStream } = require("../../../build/services/debug/order")
const { logOrderEvents } = require("../../../build/services/logging/order")
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
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            logOrderEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(2)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'created' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "CREATED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'accepted' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "ACCEPTED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'rejected' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "REJECTED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'filled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'profitLoss' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "PROFITLOSS", profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'closed' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'canceled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "CANCELED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'expired' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "EXPIRED", timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'ended' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            logOrderEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new OrderStream(props)
            logOrderEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})