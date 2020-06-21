const {DebugOrderStream} = require("../../../build/services/types/order")

describe.skip("DebugOrderStream", () => {
    describe("order lifecylce", () => {
        test("complete lifecyle: 'rejected'", done => {
            const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
            const stream = new DebugOrderStream(props)
            const events = [
                {type: "CREATED", timestamp: 1},
                {type: "REJECTED", timestamp: 123, message: 'NOT_ENOUGH_MONEY'},
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
                {type: "REJECTED", timestamp: 2, message: 'NOT_ENOUGH_MONEY'},
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