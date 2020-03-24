const {DebugAccountStream} = require("../../../build/services/base/account")
describe("DebugAccountStream", () => {
    
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

    test("should call cb with balance (not cached)", done => {
        const props = { currency: Symbol.for("abc"), a: 2 }
        const stream = new DebugAccountStream(props)
        const event = { balance: 23, timestamp: 123 };
        stream.balance(e => {
            expect(e).toBe(event);
            done()
        })
        setTimeout(() => stream.emitBalance(event), 100)
    })

    test("should call cb with balance (cached)", done => {
        const props = { currency: Symbol.for("abc"), a: 2 }
        const stream = new DebugAccountStream(props)
        const event = { balance: 23, timestamp: 123 };
        stream.once("balance", () => {
            stream.balance(e => {
                expect(e).toBe(event);
                done()
            })
        })
        stream.emitBalance(event);
    })

    test("should call cb with equity (not cached)", done => {
        const props = { currency: Symbol.for("abc"), a: 2 }
        const stream = new DebugAccountStream(props)
        const event = { equity: 23, timestamp: 123 };
        stream.equity(e => {
            expect(e).toBe(event);
            done()
        })
        setTimeout(() => stream.emitEquity(event), 100)
    })

    test("should call cb with equity (cached)", done => {
        const props = { currency: Symbol.for("abc"), a: 2 }
        const stream = new DebugAccountStream(props)
        const event = { equity: 23, timestamp: 123 };
        stream.once("equity", () => {
            stream.equity(e => {
                expect(e).toBe(event);
                done()
            })
        })
        stream.emitEquity(event);
    })
})