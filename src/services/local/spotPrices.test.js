const {fromFiles, fromSampleData} = require("../../../build/services/local/spotPrices");

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
        const stream = fromFiles({ symbol, paths: ["no.where"] })

        const events = [
            { type: "ASK_PRICE_CHANGED", timestamp: 9771, ask: 7611.79 },
            { type: "ASK_PRICE_CHANGED", timestamp: 8928, ask: 7612.52 },
            { type: "ASK_PRICE_CHANGED", timestamp: 7680, ask: 7613.21 },
            { type: "ASK_PRICE_CHANGED", timestamp: 5996, ask: 7613.24 },
            { type: "ASK_PRICE_CHANGED", timestamp: 5198, ask: 7613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 4564, ask: 7613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 4182, ask: 7613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 3516, ask: 7612.72 }
        ];
        stream.on("data", e => {
            if(e.type === "ASK_PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
    test("bid events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromFiles({ symbol, paths: ["no.where"] })

        const events = [
            { type: "BID_PRICE_CHANGED", timestamp: 9425, bid: 7612.03 },
            { type: "BID_PRICE_CHANGED", timestamp: 9110, bid: 7612.28 },
            { type: "BID_PRICE_CHANGED", timestamp: 8447, bid: 7612.73 },
            { type: "BID_PRICE_CHANGED", timestamp: 8021, bid: 7613.18 },
            { type: "BID_PRICE_CHANGED", timestamp: 7264, bid: 7613.11 },
            { type: "BID_PRICE_CHANGED", timestamp: 7026, bid: 7613.18 },
            { type: "BID_PRICE_CHANGED", timestamp: 6609, bid: 7613.21 },
            { type: "BID_PRICE_CHANGED", timestamp: 5829, bid: 7613.98 },
            { type: "BID_PRICE_CHANGED", timestamp: 5601, bid: 7614.08 },
            { type: "BID_PRICE_CHANGED", timestamp: 5198, bid: 6613.91 },
            { type: "BID_PRICE_CHANGED", timestamp: 4564, bid: 6613.17 },
            { type: "BID_PRICE_CHANGED", timestamp: 4182, bid: 6613.14 },
            { type: "BID_PRICE_CHANGED", timestamp: 3987, bid: 7613.21 }
        ];
        stream.on("data", e => {
            if(e.type === "BID_PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
    test("price events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromFiles({ symbol, paths: ["no.where"] })

        const events = [
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7611.79, bid: 6612.03 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7611.79, bid: 6612.28 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7612.52, bid: 6612.28 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7612.52, bid: 6612.73 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7612.52, bid: 6613.18 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.21, bid: 6613.18 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.21, bid: 6613.11 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.21, bid: 6613.18 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.21, bid: 6613.21 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.24, bid: 6613.21 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.24, bid: 6613.98 },
            // { type: "PRICE_CHANGED", timestamp: 9425, ask: 7613.24, bid: 6614.08 },
               { type: "PRICE_CHANGED", timestamp: 5198, ask: 7613, bid: 6613.91 },
               { type: "PRICE_CHANGED", timestamp: 4564, ask: 7613, bid: 6613.17 },
               { type: "PRICE_CHANGED", timestamp: 4182, ask: 7613, bid: 6613.14 },
            // { type: "PRICE_CHANGED", timestamp: 4182, ask: 7613, bid: 6613.21 },
            // { type: "PRICE_CHANGED", timestamp: 4182, ask: 7612.72, bid: 6613.21 },
        ];
        stream.on("data", e => {
            if(e.type === "PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
})

describe("fromSampleData", () => {
    test("ask events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const events = [
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663999771, ask: 6611.79 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663998928, ask: 6612.52 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663997680, ask: 6613.21 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663995996, ask: 6613.24 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663995198, ask: 6613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663994564, ask: 6613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663994182, ask: 6613 },
            { type: "ASK_PRICE_CHANGED", timestamp: 1577663993516, ask: 6612.72 },
        ];
        stream.on("data", e => {
            if(e.type === "ASK_PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
    test("bid events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const events = [
            { type: "BID_PRICE_CHANGED", timestamp: 1577663999425, bid: 6612.03 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663999110, bid: 6612.28 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663998447, bid: 6612.73 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663998021, bid: 6613.18 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663997264, bid: 6613.11 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663997026, bid: 6613.18 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663996609, bid: 6613.21 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663995829, bid: 6613.98 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663995601, bid: 6614.08 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663995198, bid: 6613.91 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663994564, bid: 6613.17 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663994182, bid: 6613.14 },
            { type: "BID_PRICE_CHANGED", timestamp: 1577663993987, bid: 6613.21 },
        ];
        stream.on("data", e => {
            if(e.type === "BID_PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
    test("price events", done => {
        const symbol = Symbol.for("abc")
        const stream = fromSampleData({ symbol })

        const events = [
            { type: "PRICE_CHANGED", timestamp: 1577663995198, ask: 6613, bid: 6613.91 },
            { type: "PRICE_CHANGED", timestamp: 1577663994564, ask: 6613, bid: 6613.17 },
            { type: "PRICE_CHANGED", timestamp: 1577663994182, ask: 6613, bid: 6613.14 }
        ];
        stream.on("data", e => {
            if(e.type === "PRICE_CHANGED") {
                const event = events.shift();
                expect(e).toStrictEqual(event);
                if(events.length === 0) {
                    done();
                }
            }
        });
    })
})