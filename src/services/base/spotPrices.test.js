const {DebugSpotPricesStream} = require("../../../build/services/base/spotPrices")

describe.skip("DebugSpotPricesStream", () => {
    describe("lifecylce", () => {
        test("should emit 'ask' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 23, timestamp: 123 };
            stream.once("data", e => {
                if(e.type === "ASK_PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "ASK_PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryAsk(event)
        })

        test("should emit 'bid' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { bid: 23, timestamp: 123 };
            stream.once("data", e => {
                if(e.type === "BID_PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "BID_PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryBid(event)
        })
    
        test("should emit 'price' event", done => {
            const props = { symbol: Symbol.for("abc"), a: 2 }
            const stream = new DebugSpotPricesStream(props)
            const event = { ask: 22, bid: 23, timestamp: 123 };
            stream.on("data", e => {
                if(e.type === "PRICE_CHANGED") {
                    expect(e).toStrictEqual({...event, type: "PRICE_CHANGED"});
                    done();
                }
            })
            stream.tryPrice(event)
        })
    })
})