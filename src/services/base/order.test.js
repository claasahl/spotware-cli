const {DebugOrderStream} = require("../../../build/services/base/order")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
debug.mockImplementation(() => ({ extend }))

describe("DebugOrderStream", () => {
    describe("props", () => {
        test("should expose props", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.props).toBe(props)
        })
    
        test("should freeze props", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
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
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            new DebugOrderStream(props)
            expect(debug).toHaveBeenCalledTimes(1)
            expect(extend).toHaveBeenCalledTimes(9)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'created' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("created", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'accepted' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("accepted", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'rejected' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("rejected", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'filled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            stream.emit("filled", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'profitLoss' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { profitLoss: 23, timestamp: 123 };
            stream.emit("profitLoss", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'closed' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.emit("closed", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'canceled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("canceled", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'expired' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("expired", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("log 'ended' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.emit("ended", event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith(expect.any(String), event);
        })

        test("should not log unknown events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            stream.emit("unknown", {})
            stream.emit("something", {})
            expect(log).toHaveBeenCalledTimes(0)
        })
    })

    describe("access cached events", () => {
        test("should call cb with accepted (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            expect(stream.accepted()).resolves.toBe(event);
            setTimeout(() => stream.emit("accepted", event), 100)
        })
    
        test("should call cb with accepted (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("accepted", () => {
                expect(stream.accepted()).resolves.toBe(event);
            })
            stream.emit("accepted", event);
        })

        test("should call cb with created (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            expect(stream.created()).resolves.toBe(event);
            setTimeout(() => stream.emit("created", event), 100)
        })
    
        test("should call cb with created (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("created", () => {
                expect(stream.created()).resolves.toBe(event);
            })
            stream.emit("created", event);
        })

        test("should call cb with rejected (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            expect(stream.rejected()).resolves.toBe(event);
            setTimeout(() => stream.emit("rejected", event), 100)
        })
    
        test("should call cb with rejected (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("rejected", () => {
                expect(stream.rejected()).resolves.toBe(event);
            })
            stream.emit("rejected", event);
        })

        test("should call cb with filled (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            expect(stream.filled()).resolves.toBe(event);
            setTimeout(() => stream.emit("filled", event), 100)
        })
    
        test("should call cb with filled (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            stream.once("filled", () => {
                expect(stream.filled()).resolves.toBe(event);
            })
            stream.emit("filled", event);
        })

        test("should call cb with profitLoss (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { price: 123, profitLoss: 23, timestamp: 123 };
            expect(stream.profitLoss()).resolves.toBe(event);
            setTimeout(() => stream.emit("profitLoss", event), 100)
        })
    
        test("should call cb with profitLoss (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { price: 123, profitLoss: 23, timestamp: 123 };
            stream.once("profitLoss", () => {
                expect(stream.profitLoss()).resolves.toBe(event);
            })
            stream.emit("profitLoss", event);
        })
        
        test("should call cb with closed (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            expect(stream.closed()).resolves.toBe(event);
            setTimeout(() => stream.emit("closed", event), 100)
        })
    
        test("should call cb with closed (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("closed", () => {
                expect(stream.closed()).resolves.toBe(event);
            })
            stream.emit("closed", event);
        })
        
        test("should call cb with canceled (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            expect(stream.canceled()).resolves.toBe(event);
            setTimeout(() => stream.emit("canceled", event), 100)
        })
    
        test("should call cb with canceled (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("canceled", () => {
                expect(stream.canceled()).resolves.toBe(event);
            })
            stream.emit("canceled", event);
        })

        test("should call cb with expired (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            expect(stream.expired()).resolves.toBe(event);
            setTimeout(() => stream.emit("expired", event), 100)
        })
    
        test("should call cb with expired (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("expired", () => {
                expect(stream.expired()).resolves.toBe(event);
            })
            stream.emit("expired", event);
        })

        test("should call cb with ended (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            expect(stream.ended()).resolves.toBe(event);
            setTimeout(() => stream.emit("ended", event), 100)
        })
    
        test("should call cb with ended (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("ended", () => {
                expect(stream.ended()).resolves.toBe(event);
            })
            stream.emit("ended", event);
        })
    })

    describe("actions", () => {
        test("close", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.close).toThrow("not implemented")
        })
        test("cancel", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.cancel).toThrow("not implemented")
        })
        test("end", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.end).toThrow("not implemented")
        })
        test("amend", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.amend).toThrow("not implemented")
        })
    })

    describe("emitXXX helpers", () => {
        test("should emit 'created' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("created", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitCreated(event)
        })

        test("should emit 'accepted' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("accepted", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitAccepted(event)
        })

        test("should emit 'rejected' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("rejected", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitRejected(event)
        })

        test("should emit 'filled' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            stream.once("filled", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitFilled(event)
        })
    
        test("should emit 'profitLoss' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { price: 123, profitLoss: 23, timestamp: 123 };
            stream.once("profitLoss", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitProfitLoss(event)
        })

        test("should emit 'closed' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("closed", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitClosed(event)
        })

        test("should emit 'canceled' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("canceled", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitCanceled(event)
        })

        test("should emit 'expired' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("expired", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitExpired(event)
        })

        test("should emit 'ended' event", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("ended", e => {
                expect(e).toBe(event);
                done()
            })
            stream.emitEnded(event)
        })
    })
})