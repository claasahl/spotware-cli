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
        test("should call cb with accepted (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ACCEPTED", timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.accepted()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with accepted (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ACCEPTED", timestamp: 123 };
            stream.push(event)
            await expect(stream.accepted()).resolves.toStrictEqual(event);
        })

        test("should call cb with created (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CREATED", timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.created()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with created (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CREATED", timestamp: 123 };
            stream.push(event)
            await expect(stream.created()).resolves.toStrictEqual(event);
        })

        test("should call cb with rejected (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "REJECTED", timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.rejected()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with rejected (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "REJECTED", timestamp: 123 };
            stream.push(event)
            await expect(stream.rejected()).resolves.toStrictEqual(event);
        })

        test("should call cb with filled (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.filled()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with filled (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "FILLED", entry: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.filled()).resolves.toStrictEqual(event);
        })

        test("should call cb with profitLoss (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "PROFITLOSS", price: 123, profitLoss: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.profitLoss()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with profitLoss (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "PROFITLOSS", price: 123, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.profitLoss()).resolves.toStrictEqual(event);
        })
        
        test("should call cb with closed (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.closed()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with closed (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CLOSED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.closed()).resolves.toStrictEqual(event);
        })
        
        test("should call cb with canceled (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CANCELED", timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.canceled()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with canceled (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "CANCELED", timestamp: 123 };
            stream.push(event)
            await expect(stream.canceled()).resolves.toStrictEqual(event);
        })

        test("should call cb with expired (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "EXPIRED", timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.expired()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with expired (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "EXPIRED", timestamp: 123 };
            stream.push(event)
            await expect(stream.expired()).resolves.toStrictEqual(event);
        })

        test("should call cb with ended (not cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            setTimeout(() => stream.push(event), 50)
            await expect(stream.ended()).resolves.toStrictEqual(event);
        })
    
        test("should call cb with ended (cached)", async () => {
            const props = { id: 0, symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const event = { type: "ENDED", exit: 42, profitLoss: 23, timestamp: 123 };
            stream.push(event)
            await expect(stream.ended()).resolves.toStrictEqual(event);
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