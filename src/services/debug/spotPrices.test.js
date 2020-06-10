jest.mock("../../../build/services/logging")
const {SpotPricesStream} = require("../../../build/services/debug/spotPrices")
const logging = require("../../../build/services/logging")

describe("debug", () => {
    describe("SpotPricesStream", () => {
        describe("props", () => {
            test("should expose props", () => {
                const props = { symbol: Symbol.for("abc"), a: 2 }
                const stream = new SpotPricesStream(props)
                expect(stream.props).toStrictEqual(props)
            })
        
            test("should freeze props", () => {
                const props = { symbol: Symbol.for("abc"), a: 2 }
                const stream = new SpotPricesStream(props)
                expect(Object.isFrozen(props)).toBe(true)
                expect(Object.isFrozen(stream.props)).toBe(true)
            })
        })

        describe("logging", () => {
            test("use logging decorator", () => {
                const props = { symbol: Symbol.for("abc"), a: 2 }
                const stream = new SpotPricesStream(props)
                expect(logging.logSpotPriceEvents).toHaveBeenCalledWith(stream)
            })
        })

        describe("actions", () => {
            test("trendbars", () => {
                const props = { symbol: Symbol.for("abc"), a: 2 }
                const stream = new SpotPricesStream(props)
                expect(stream.trendbars).toThrow("not implemented")
            })
        })
    })
})