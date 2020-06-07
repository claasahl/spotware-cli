const {TrendbarsStream} = require("../../../build/services/debug/trendbars")

describe("debug", () => {
    describe("TrendbarsStream", () => {
        describe("props", () => {
            test("should expose props", () => {
                const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 };
                const stream = new TrendbarsStream(props)
                expect(stream.props).toStrictEqual(props)
            })
            
            test("should freeze props", () => {
                const props = { symbol: Symbol.for("abc"), period: 60000, a: 2 };
                const stream = new TrendbarsStream(props)
                expect(Object.isFrozen(props)).toBe(true)
                expect(Object.isFrozen(stream.props)).toBe(true)
            })
        })
    })
})