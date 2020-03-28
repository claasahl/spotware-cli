const {fromFile, fromSampleData} = require("../../../build/services/local/spotPrices");

jest.mock("fs", () => ({
    createReadStream() {
        const { Readable } = require("stream")
        const stream = new Readable();
        stream._read = () => {}
        stream.push(`{ "ask": 7611.79, "timestamp": 9771 }
{ "bid": 7612.03, "timestamp": 9425 }
{ "bid": 7612.28, "timestamp": 9110 }
{ "ask": 7612.52, "timestamp": 8928 }
{ "bid": 7612.73, "timestamp": 8447 }
{ "bid": 7613.18, "timestamp": 8021 }
{ "ask": 7613.21, "timestamp": 7680 }
{ "bid": 7613.11, "timestamp": 7264 }
{ "bid": 7613.18, "timestamp": 7026 }
{ "bid": 7613.21, "timestamp": 6609 }
{ "ask": 7613.24, "timestamp": 5996 }
{ "bid": 7613.98, "timestamp": 5829 }
{ "bid": 7614.08, "timestamp": 5601 }
{ "ask": 7613, "bid": 6613.91, "timestamp": 5198 }
{ "ask": 7613, "bid": 6613.17, "timestamp": 4564 }
{ "ask": 7613, "bid": 6613.14, "timestamp": 4182 }
{ "bid": 7613.21, "timestamp": 3987 }
{ "ask": 7612.72, "timestamp": 3516 }
abc`)
        return stream;
    }
}))

describe("fromFile", () => {
    test("ask events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromFile({ symbol, path: "no.where" })

        const onEvent = jest.fn();
        stream.on("ask", onEvent);
        setTimeout(() => {
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 9771, ask: 7611.79 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 8928, ask: 7612.52 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 7680, ask: 7613.21 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5996, ask: 7613.24 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5198, ask: 7613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4564, ask: 7613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4182, ask: 7613 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 3516, ask: 7612.72 })
            expect(onEvent).toHaveBeenCalledTimes(8)
            done()
        }, 100)
    })
    test("bid events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromFile({ symbol, path: "no.where" })

        const onEvent = jest.fn();
        stream.on("bid", onEvent);
        setTimeout(() => {
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, bid: 7612.03 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 9110, bid: 7612.28 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 8447, bid: 7612.73 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 8021, bid: 7613.18 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 7264, bid: 7613.11 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 7026, bid: 7613.18 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 6609, bid: 7613.21 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5829, bid: 7613.98 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5601, bid: 7614.08 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5198, bid: 6613.91 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4564, bid: 6613.17 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4182, bid: 6613.14 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 3987, bid: 7613.21 })
            expect(onEvent).toHaveBeenCalledTimes(13)
            done()
        }, 100)
    })
    test("price events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromFile({ symbol, path: "no.where" })

        const onEvent = jest.fn();
        stream.on("price", onEvent);
        setTimeout(() => {
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7611.79, bid: 6612.03 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7611.79, bid: 6612.28 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7612.52, bid: 6612.28 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7612.52, bid: 6612.73 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7612.52, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.21, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.21, bid: 6613.11 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.21, bid: 6613.18 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.21, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.24, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.24, bid: 6613.98 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 9425, ask: 7613.24, bid: 6614.08 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 5198, ask: 7613, bid: 6613.91 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4564, ask: 7613, bid: 6613.17 })
            expect(onEvent).toHaveBeenCalledWith({ timestamp: 4182, ask: 7613, bid: 6613.14 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 4182, ask: 7613, bid: 6613.21 })
            // expect(onEvent).toHaveBeenCalledWith({ timestamp: 4182, ask: 7612.72, bid: 6613.21 })
            expect(onEvent).toHaveBeenCalledTimes(3)
            done()
        }, 100)
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