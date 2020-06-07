const {DebugOrderStream} = require("../../../build/services/base/order")
const debug = require("debug")

jest.mock("debug");
const log = jest.fn(() => undefined)
const extend = jest.fn(() => log)
log["extend"] = extend;
debug.mockImplementation(() => ({ extend }))

describe.skip("DebugOrderStream", () => {
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
        test("ACCEPTED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.acceptedOrNull()).toBeNull();
        })
    
        test("ACCEPTED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ACCEPTED", timestamp: 123 };
            stream.push(event)
            expect(stream.acceptedOrNull()).toStrictEqual(event);
        })

        test("CREATED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.createdOrNull()).toBeNull();
        })
    
        test("CREATED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CREATED", timestamp: 123 };
            stream.push(event)
            expect(stream.createdOrNull()).toStrictEqual(event);
        })

        test("REJECTED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.rejectedOrNull()).toBeNull();
        })
    
        test("REJECTED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "REJECTED", timestamp: 123 };
            stream.push(event)
            expect(stream.rejectedOrNull()).toStrictEqual(event);
        })

        test("FILLED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.filledOrNull()).toBeNull();
        })
    
        test("FILLED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            stream.push(event)
            expect(stream.filledOrNull()).toStrictEqual(event);
        })

        test("PROFITLOSS (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.profitLossOrNull()).toBeNull();
        })
    
        test("PROFITLOSS (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "PROFITLOSS", price: 123, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(stream.profitLossOrNull()).toStrictEqual(event);
        })
        
        test("CLOSED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.closedOrNull()).toBeNull();
        })
    
        test("CLOSED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(stream.closedOrNull()).toStrictEqual(event);
        })
        
        test("CANCELED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.canceledOrNull()).toBeNull();
        })
    
        test("CANCELED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CANCELED", timestamp: 123 };
            stream.push(event)
            expect(stream.canceledOrNull()).toStrictEqual(event);
        })

        test("EXPIRED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.expiredOrNull()).toBeNull();
        })
    
        test("EXPIRED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "EXPIRED", timestamp: 123 };
            stream.push(event)
            expect(stream.expiredOrNull()).toStrictEqual(event);
        })

        test("ENDED (not cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.endedOrNull()).toBeNull();
        })
    
        test("ENDED (cached)", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            expect(stream.endedOrNull()).toStrictEqual(event);
        })
    })

    describe("actions", () => {
        test("close", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.closeOrder).toThrow("not implemented")
        })
        test("cancel", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.cancelOrder).toThrow("not implemented")
        })
        test("end", () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            expect(stream.endOrder).toThrow("not implemented")
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