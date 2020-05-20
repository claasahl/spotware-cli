const {DebugOrderStream} = require("../../../build/services/base/order")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
log["extend"] = extend;
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
            expect(extend).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledTimes(0)
        })

        test("log 'created' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CREATED", timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'accepted' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ACCEPTED", timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'rejected' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "REJECTED", timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'filled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'profitLoss' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "PROFITLOSS", profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'closed' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'canceled' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CANCELED", timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'expired' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "EXPIRED", timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("log 'ended' events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(log).toHaveBeenCalledTimes(1)
            expect(log).toHaveBeenCalledWith("%j", event);
        })

        test("should not log unknown events", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            stream.push({type: "unknown"})
            stream.push({type: "something"})
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
            expect(stream.close()).rejects.toThrow("not implemented")
        })
        test("cancel", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.cancel()).rejects.toThrow("not implemented")
        })
        test("end", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.end()).rejects.toThrow("not implemented")
        })
    })

    describe("order lifecylce", () => {
        test("complete lifecyle: 'rejected'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "REJECTED", timestamp: 123},
                {type: "ENDED", timestamp: 123},
            ]
            stream.on("data", e => expect(e).toStrictEqual(events.shift()))
            stream.once("end", () => {
                expect(events.length).toBe(0);
                done();
            })
            stream.tryCreate({ timestamp: 1 })
            stream.tryReject({ timestamp: 123 })
        })

        test("complete lifecyle: 'canceled'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "CANCELED", timestamp: 123},
                {type: "ENDED", timestamp: 123},
            ]
            stream.on("data", e => expect(e).toStrictEqual(events.shift()))
            stream.once("end", () => {
                expect(events.length).toBe(0);
                done();
            })
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryCancel({ timestamp: 123 })
        })

        test("complete lifecyle: 'expired'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "EXPIRED", timestamp: 123},
                {type: "ENDED", timestamp: 123},
            ]
            stream.on("data", e => expect(e).toStrictEqual(events.shift()))
            stream.once("end", () => {
                expect(events.length).toBe(0);
                done();
            })
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryExpire({ timestamp: 123 })
        })

        test("complete lifecyle: 'closed'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "FILLED", timestamp: 3, entry: 23 },
                {type: "PROFITLOSS", timestamp: 4, price: 124, profitLoss: 24 },
                {type: "PROFITLOSS", timestamp: 5, price: 125, profitLoss: 25 },
                {type: "CLOSED", timestamp: 123, exit: 42, profitLoss: 23},
                {type: "ENDED", timestamp: 123, exit: 42, profitLoss: 23},
            ]
            stream.on("data", e => expect(e).toStrictEqual(events.shift()))
            stream.once("end", () => {
                expect(events.length).toBe(0);
                done();
            })
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryFill({ timestamp: 3, entry: 23 })
            stream.tryProfitLoss({ timestamp: 4, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 5, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 123, exit: 42, profitLoss: 23 })
        })

        test("when in state 'uninitialized': emit no events, but 'created'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            stream.on("data", () => {
                fail('should not have happened')
            })
            // stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
            setTimeout(done, 50)
        })
        test("when in state 'created': emit no events, but 'accepted', 'rejected', 'canceled'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1}
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            // stream.tryAccept({ timestamp: 2 })
            // stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            // stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'accepted': emit no events, but 'expired', 'canceled', 'filled'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2}
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            // stream.tryExpire({ timestamp: 4 })
            // stream.tryCancel({ timestamp: 5 })
            // stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'filled': emit no events, but 'profitloss', 'closed'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "FILLED", timestamp: 6, entry: 23 },
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryFill({ timestamp: 6, entry: 23 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            // stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            // stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            // stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'expired': emit no more events", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "EXPIRED", timestamp: 3},
                {type: "ENDED", timestamp: 3},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryExpire({ timestamp: 3 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'rejected': emit no more events", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "REJECTED", timestamp: 2},
                {type: "ENDED", timestamp: 2},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryReject({ timestamp: 2 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'canceled': emit no more events", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "CANCELED", timestamp: 5},
                {type: "ENDED", timestamp: 5},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryCancel({ timestamp: 5 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
        test("when in state 'closed': emit no more events", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "ACCEPTED", timestamp: 2},
                {type: "FILLED", timestamp: 6, entry: 23 },
                {type: "PROFITLOSS", timestamp: 7, price: 124, profitLoss: 24 },
                {type: "PROFITLOSS", timestamp: 8, price: 125, profitLoss: 25 },
                {type: "CLOSED", timestamp: 9, exit: 42, profitLoss: 23},
                {type: "ENDED", timestamp: 9, exit: 42, profitLoss: 23},
            ]
            stream.on("data", e => {
                expect(e).toStrictEqual(events.shift());
                if(events.length === 0) {
                    done()
                }
            })
            // events to enter state
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })

            // should not have any effect
            stream.tryCreate({ timestamp: 1 })
            stream.tryAccept({ timestamp: 2 })
            stream.tryReject({ timestamp: 3 })
            stream.tryExpire({ timestamp: 4 })
            stream.tryCancel({ timestamp: 5 })
            stream.tryFill({ timestamp: 6, entry: 23 })
            stream.tryProfitLoss({ timestamp: 7, price: 124, profitLoss: 24 })
            stream.tryProfitLoss({ timestamp: 8, price: 125, profitLoss: 25 })
            stream.tryClose({ timestamp: 9, exit: 42, profitLoss: 23 })
        })
    })
})