const {DebugAccountStream} = require("../../../build/services/base/account")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
debug.mockImplementation(() => log)

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

    describe("access cached events", () => {
        test("should call cb with balance (not cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.balance()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with balance (cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.balance()).resolves.toStrictEqual(event);
        })

        test("should call cb with transaction (not cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.transaction()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with transaction (cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.transaction()).resolves.toStrictEqual(event);
        })

        test("should call cb with equity (not cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.equity()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with equity (cached)", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.equity()).resolves.toStrictEqual(event);
        })

        // test("should call cb with order (not cached)", async () => {
        //     const props = { currency: Symbol.for("abc"), a: 2 }
        //     const stream = new DebugAccountStream(props)
        //     const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
        //     setTimeout(() => stream.push(event), 50)
        //     await expect(stream.order()).resolves.toStrictEqual(event);
        // })
    
        // test("should call cb with order (cached)", async () => {
        //     const props = { currency: Symbol.for("abc"), a: 2 }
        //     const stream = new DebugAccountStream(props)
        //     const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
        //     stream.push(event)
        //     await expect(stream.order()).resolves.toStrictEqual(event);
        // })
    })

    describe("actions", () => {
        test("marketOrder", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            await expect(stream.marketOrder()).rejects.toThrow("not implemented")
        })
        test("stopOrder", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            await expect(stream.stopOrder()).rejects.toThrow("not implemented")
        })
        test("spotPrices", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            await expect(stream.spotPrices()).rejects.toThrow("not implemented")
        })
        test("trendbars", async () => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            await expect(stream.trendbars()).rejects.toThrow("not implemented")
        })
    })

    describe("tryXXX helpers", () => {
        test("should try 'balance' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "BALANCE_CHANGED", balance: 23, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "BALANCE_CHANGED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            stream.tryBalance(event)
        })

        test("should try 'transaction' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "TRANSACTION", amount: 23, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "TRANSACTION") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            stream.tryTransaction(event)
        })
    
        test("should try 'equity' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "EQUITY_CHANGED", equity: 23, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "EQUITY_CHANGED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            stream.tryEquity(event)
        })

        test("should try 'order' event", done => {
            const props = { currency: Symbol.for("abc"), a: 2 }
            const stream = new DebugAccountStream(props)
            const event = { type: "CREATED", timestamp: 123, id: "1", symbol: Symbol.for("abc"), tradeSide: "SELL", volume: 0.1, orderType: "MARKET" };
            stream.on("data", e => {
                if(e.type === "CREATED") {
                    expect(e).toStrictEqual(event);
                    done()
                }
            })
            stream.tryOrder(event)
        })
    })
})