const {DebugAccountStream} = require("../../../build/services/base/account")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
debug.mockImplementation(() => ({ extend }))

describe("DebugAccountStream", () => {
    describe("props", () => {
        test("should expose props", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            expect(stream.props).toBe(props)
        })
    
        test("should freeze props", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
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
            const props = { currency: Symbol.for("abc"), a: 2 }
            new DebugAccountStream(props)
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(4)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'balance' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { balance: 23, timestamp: 123 };
            stream.emit("balance", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'transaction' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { balance: 23, timestamp: 123 };
            stream.emit("transaction", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'equity' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { equity: 23, timestamp: 123 };
            stream.emit("equity", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'order' events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { timestamp: 123, status: "CREATED" };
            stream.emit("order", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("should not log unknown events", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            stream.emit("unknown", {})
            stream.emit("something", {})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })

    describe("access cached events", () => {
        test("should call cb with balance (not cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { balance: 23, timestamp: 123 };
            expect(stream.balance()).resolves.toBe(event);
            setTimeout(() => stream.emit("balance", event), 100)
        })
    
        test("should call cb with balance (cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { balance: 23, timestamp: 123 };
            stream.once("balance", () => {
                expect(stream.balance()).resolves.toBe(event);
            })
            stream.emit("balance", event);
        })

        test("should call cb with transaction (not cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { amount: 23, timestamp: 123 };
            expect(stream.transaction()).resolves.toBe(event);
            setTimeout(() => stream.emit("transaction", event), 100)
        })
    
        test("should call cb with transaction (cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { amount: 23, timestamp: 123 };
            stream.once("transaction", () => {
                expect(stream.transaction()).resolves.toBe(event);
            })
            stream.emit("transaction", event);
        })

        test("should call cb with equity (not cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { equity: 23, timestamp: 123 };
            expect(stream.equity()).resolves.toBe(event);
            setTimeout(() => stream.emit("equity", event), 100)
        })
    
        test("should call cb with equity (cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { equity: 23, timestamp: 123 };
            stream.once("equity", () => {
                expect(stream.equity()).resolves.toBe(event);
            })
            stream.emit("equity", event);
        })

        test("should call cb with order (not cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { timestamp: 123, status: "CREATED" };
            expect(stream.order()).resolves.toBe(event);
            setTimeout(() => stream.emit("order", event), 100)
        })
    
        test("should call cb with order (cached)", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { timestamp: 123, status: "CREATED" };
            stream.once("order", () => {
                expect(stream.order()).resolves.toBe(event);
            })
            stream.emit("order", event);
        })
    })

    describe("actions", () => {
        test("marketOrder", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            expect(stream.marketOrder).toThrow("not implemented")
        })
        test("stopOrder", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            expect(stream.stopOrder).toThrow("not implemented")
        })
        test("spotPrices", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            expect(stream.spotPrices).toThrow("not implemented")
        })
        test("trendbars", () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            expect(stream.trendbars).toThrow("not implemented")
        })
    })

    describe("emitXXX helpers", () => {
        test("should emit 'balance' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { balance: 23, timestamp: 123 };
            stream.once("balance", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitBalance(event)
        })

        test("should emit 'transaction' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { amount: 23, timestamp: 123 };
            stream.once("transaction", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitTransaction(event)
        })
    
        test("should emit 'equity' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { equity: 23, timestamp: 123 };
            stream.once("equity", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitEquity(event)
        })

        test("should emit 'order' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { timestamp: 123 };
            stream.once("order", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitOrder(event)
        })
    })
})