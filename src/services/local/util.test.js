const {includesCurrency} = require("../../../build/services/local/util");

describe("includesCurrency", () => {
    test("matching quote currency", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("EUR")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(true);
    })
    test("matching base currency", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("BTC")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(true);
    })
    test("no match (1)", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("USD")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
    test("no match (2)", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("TC")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
    test("no match (3)", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("C/E")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
    test("empty currency", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
    test("empty symbol", () => {
        const symbol = Symbol.for("BTC/EUR")
        const currency = Symbol.for("")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
    test("empty symbol and empty currency", () => {
        const symbol = Symbol.for("")
        const currency = Symbol.for("")
        const result = includesCurrency(symbol, currency)
        expect(result).toBe(false);
    })
})