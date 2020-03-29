const { fromNothing } = require("../../../build/services/local/account");
const { DebugSpotPricesStream } = require("../../../build/services/base/spotPrices")

describe("fromNothing", () => {
    test("'transaction' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { timestamp: expect.any(Number), amount: 500 }
        stream.on("transaction", e => {
            expect(e).toStrictEqual(event);
            done()
        })
    })
    test("'balance' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { timestamp: expect.any(Number), balance: 500 }
        stream.on("balance", e => {
            expect(e).toStrictEqual(event);
            done()
        })
    })
    test("'equity' event with initial balance", done => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = () => spotPrices
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const event = { timestamp: expect.any(Number), equity: 500 }
        stream.on("equity", e => {
            expect(e).toStrictEqual(event);
            done()
        })
    })
    test("get spot prices", () => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = jest.fn(() => spotPrices)
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        expect(stream.spotPrices({ symbol })).toBeTruthy();
        expect(spots).toHaveBeenCalledWith({ symbol })
        expect(spots).toHaveBeenCalledTimes(1)
    })
    test("get trendbars", () => {
        const symbol = Symbol.for("abc/def")
        const spotPrices = new DebugSpotPricesStream({ symbol })
        const currency = Symbol.for("abc")
        const spots = jest.fn(() => spotPrices)
        const initialBalance = 500;
        const stream = fromNothing({ currency, spots, initialBalance})
        const period = 1000;
        const trendbars = stream.trendbars({ symbol, period });
        expect(trendbars.props).toStrictEqual({ symbol, period, spots: spotPrices });
        expect(spots).toHaveBeenCalledWith({ symbol })
        expect(spots).toHaveBeenCalledTimes(1)
    })
})