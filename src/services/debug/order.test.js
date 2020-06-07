const {OrderStream} = require("../../../build/services/debug/order")

describe("debug", () => {
    describe("OrderStream", () => {
        describe("props", () => {
            test("should expose props", () => {
                const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
                const stream = new OrderStream(props)
                expect(stream.props).toStrictEqual(props)
            })
        
            test("should freeze props", () => {
                const props = { id: "0", symbol: Symbol.for("abc"), tradeSide: "BUY", volume: 1, orderType: "MARKET", a: 2 }
                const stream = new OrderStream(props)
                expect(Object.isFrozen(props)).toBe(true)
                expect(Object.isFrozen(stream.props)).toBe(true)
            })
        })
    
    })
})