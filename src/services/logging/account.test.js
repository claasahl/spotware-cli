const { AccountStream } = require("../../../build/services/debug/account")
const { logAccountEvents } = require("../../../build/services/logging/account")
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
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            logAccountEvents(stream);
            expect(debug).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'balance' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'transaction' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenNthCalledWith(1, "%j", event);
        })

        test("log 'equity' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'order' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
            logAccountEvents(stream);
            stream.emit("data", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new AccountStream(props)
            logAccountEvents(stream);
            stream.emit("data", { type: "UNKNOWN" })
            stream.emit("data", { something: 23 })
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})