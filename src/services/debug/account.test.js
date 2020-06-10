jest.mock("../../../build/services/logging")
const {AccountStream} = require("../../../build/services/debug/account")
const logging = require("../../../build/services/logging")

describe("debug", () => {
    describe("AccountStream", () => {
        describe("props", () => {
            test("should expose props", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(stream.props).toStrictEqual(props)
            })
        
            test("should freeze props", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(Object.isFrozen(props)).toBe(true)
                expect(Object.isFrozen(stream.props)).toBe(true)
            })
        })

        describe("logging", () => {
            test("use logging decorator", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(logging.logAccountEvents).toHaveBeenCalledWith(stream)
            })
        })

        describe("actions", () => {
            test("marketOrder", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(stream.marketOrder).toThrow("not implemented")
            })
            test("stopOrder", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(stream.stopOrder).toThrow("not implemented")
            })
            test("spotPrices", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(stream.spotPrices).toThrow("not implemented")
            })
            test("trendbars", () => {
                const props = { currency: Symbol.for("abc"), a: 2 }
                const stream = new AccountStream(props)
                expect(stream.trendbars).toThrow("not implemented")
            })
        })
    })
})