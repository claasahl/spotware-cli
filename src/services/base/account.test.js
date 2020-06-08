const {DebugAccountStream} = require("../../../build/services/base/account")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
debug.mockImplementation(() => log)

describe.skip("DebugAccountStream", () => {
    describe("log events", () => {
        beforeEach(() => {
            debug.mockClear();
            log.mockClear();
        });

        test("setup loggers", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            new DebugAccountStream(props)
            expect(debug).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'balance' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'transaction' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(2)
            expect(log).toHaveBeenNthCalledWith(1, "%j", event);
            expect(log).toHaveBeenNthCalledWith(2, "%j", {type: "BALANCE_CHANGED", timestamp: 123, balance: 23});
        })

        test("log 'equity' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'order' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            stream.push({ type: "UNKNOWN"})
            stream.push({something: 23})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })
})