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
            expect(extend).toHaveBeenCalledTimes(5)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'accepted' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.emit("accepted", event)
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
        test("should call cb with accepted (not cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.accepted(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("accepted", event), 100)
        })
    
        test("should call cb with accepted (cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { timestamp: 123 };
            stream.once("accepted", () => {
                stream.accepted(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("accepted", event);
        })

        test("should call cb with filled (not cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            stream.filled(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("filled", event), 100)
        })
    
        test("should call cb with filled (cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { entry: 23, timestamp: 123 };
            stream.once("filled", () => {
                stream.filled(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("filled", event);
        })

        test("should call cb with profitLoss (not cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { profitLoss: 23, timestamp: 123 };
            stream.profitLoss(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("profitLoss", event), 100)
        })
    
        test("should call cb with profitLoss (cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { profitLoss: 23, timestamp: 123 };
            stream.once("profitLoss", () => {
                stream.profitLoss(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("profitLoss", event);
        })
        
        test("should call cb with closed (not cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.closed(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("closed", event), 100)
        })
    
        test("should call cb with closed (cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("closed", () => {
                stream.closed(e => {
                    expect(e).toBe(event);
                    done()
                })
            })
            stream.emit("closed", event);
        })

        test("should call cb with ended (not cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.ended(e => {
                expect(e).toBe(event);
                done()
            })
            setTimeout(() => stream.emit("ended", event), 100)
        })
    
        test("should call cb with ended (cached)", done => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { exit: 42, profitLoss: 23, timestamp: 123 };
            stream.once("ended", () => {
                stream.ended(e => {
                    expect(e).toBe(event);
                    done()
                })
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
            const event = { profitLoss: 23, timestamp: 123 };
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