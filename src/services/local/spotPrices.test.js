const {fromFile, fromSampleData} = require("../../../build/services/local/spotPrices");

describe("fromFile", () => {
    test("", () => {
    
    })
})

describe("fromSampleData", () => {
    test("ask events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const onEvent = jest.fn();
        stream.on("ask", onEvent);
        setTimeout(() => {
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999771, ask: 6611.79 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663998928, ask: 6612.52 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663997680, ask: 6613.21 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995996, ask: 6613.24 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995198, ask: 6613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994564, ask: 6613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994182, ask: 6613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663993516, ask: 6612.72 })
            expect(onEvent).toHaveBeenCalledTimes(8)
            done()
        }, 100)
    })
    test("bid events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const onEvent = jest.fn();
        stream.on("bid", onEvent);
        setTimeout(() => {
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, bid: 6612.03 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999110, bid: 6612.28 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663998447, bid: 6612.73 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663998021, bid: 6613.18 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663997264, bid: 6613.11 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663997026, bid: 6613.18 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663996609, bid: 6613.21 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995829, bid: 6613.98 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995601, bid: 6614.08 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995198, bid: 6613.91 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994564, bid: 6613.17 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994182, bid: 6613.14 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663993987, bid: 6613.21 })
            expect(onEvent).toHaveBeenCalledTimes(13)
            done()
        }, 100)
    })
    test("price events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const onEvent = jest.fn();
        stream.on("price", onEvent);
        setTimeout(() => {
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6611.79, bid: 6612.03 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6611.79, bid: 6612.28 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6612.52, bid: 6612.28 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6612.52, bid: 6612.73 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6612.52, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.21, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.21, bid: 6613.11 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.21, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.21, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.24, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.24, bid: 6613.98 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663999425, ask: 6613.24, bid: 6614.08 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663995198, ask: 6613, bid: 6613.91 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994564, ask: 6613, bid: 6613.17 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994182, ask: 6613, bid: 6613.14 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994182, ask: 6613, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 1577663994182, ask: 6612.72, bid: 6613.21 })
            expect(onEvent).toHaveBeenCalledTimes(3)
            done()
        }, 100)
    })
})