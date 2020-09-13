import { fromFiles } from "../services/local";
import ms from "ms";
import fs from "fs"
import { finished } from "stream";
import { PriceChangedEvent } from "../services/types";
import * as G from "../services/generic"
import * as T from "../services/types"
import { bullish, bearish } from "indicators"

export type Oppurtunity = {
    orderType: "BUY" | "SELL",
    enter: PriceChangedEvent,
    high: PriceChangedEvent,
    low: PriceChangedEvent
}

export type Range = {
    id: string
    tradeSide: "SELL" | "BUY"
    trendbars: T.TrendbarEvent[]
    fromTimestamp: number,
    from: Date,
    toTimestamp: number,
    to: Date,
    ask: {
        series: (PriceChangedEvent & { hl: "high" | "low", date: Date })[]
        high: (PriceChangedEvent & { date: Date })
        low: (PriceChangedEvent & { date: Date })
    },
    bid: {
        series: (PriceChangedEvent & { hl: "high" | "low", date: Date })[]
        high: (PriceChangedEvent & { date: Date })
        low: (PriceChangedEvent & { date: Date })
    },
    oppurtunities: Oppurtunity[]
}

function emptyRange(timestamp: T.Timestamp, id: string, tradeSide: T.TradeSide, trendbars: T.TrendbarEvent[], range: number): Range {
    return {
        id,
        tradeSide,
        trendbars,
        fromTimestamp: timestamp,
        from: new Date(timestamp),
        toTimestamp: timestamp + range,
        to: new Date(timestamp + range),
        ask: {
            series: [],
            high: {type: "PRICE_CHANGED",timestamp:0, date: new Date(0), ask: Number.MIN_VALUE, bid: Number.MIN_VALUE},
            low: {type: "PRICE_CHANGED",timestamp:0, date: new Date(0), ask: Number.MAX_VALUE, bid: Number.MAX_VALUE},
        },
        bid: {
            series: [],
            high: {type: "PRICE_CHANGED",timestamp:0, date: new Date(0), ask: Number.MIN_VALUE, bid: Number.MIN_VALUE},
            low: {type: "PRICE_CHANGED",timestamp:0, date: new Date(0), ask: Number.MAX_VALUE, bid: Number.MAX_VALUE},
        },
        oppurtunities: []
    }
}

function engulfed(candleA: T.TrendbarEvent, candleB: T.TrendbarEvent): boolean {
    const upperA = candleA.high;
    const lowerA = candleA.low;
    const upperB = candleB.high;
    const lowerB = candleB.low;
    return (
        (upperA >= upperB && lowerA < lowerB) ||
        (upperA > upperB && lowerA <= lowerB)
    );
}

function trackAskPrices(ranges: Range[], e: PriceChangedEvent) {
    for(const range of ranges) {
        if (e.timestamp >= range.fromTimestamp && e.timestamp < range.toTimestamp) {
            const [lastEntry] = range.ask.series.slice(-1)
            if (range.ask.high.ask < e.ask) {
                if (lastEntry && lastEntry.hl === "high") {
                    range.ask.series.pop()
                }
                range.ask.series.push({ ...e, hl: "high", date: new Date(e.timestamp) })
                range.ask.high = { ...e, date: new Date(e.timestamp) }
            }
            if (range.ask.low.ask > e.ask) {
                if (lastEntry && lastEntry.hl === "low") {
                    range.ask.series.pop()
                }
                range.ask.series.push({ ...e, hl: "low", date: new Date(e.timestamp) })
                range.ask.low = { ...e, date: new Date(e.timestamp) }
            }
        }
    }
}

function trackBidPrices(ranges: Range[], e: PriceChangedEvent) {
    for(const range of ranges) {
        if (e.timestamp >= range.fromTimestamp && e.timestamp < range.toTimestamp) {
            const [lastEntry] = range.bid.series.slice(-1)
            if (range.bid.high.bid < e.bid) {
                if (lastEntry && lastEntry.hl === "high") {
                    range.bid.series.pop()
                }
                range.bid.series.push({ ...e, hl: "high", date: new Date(e.timestamp) })
                range.bid.high = { ...e, date: new Date(e.timestamp) }
            }
            if (range.bid.low.bid > e.bid) {
                if (lastEntry && lastEntry.hl === "low") {
                    range.bid.series.pop()
                }
                range.bid.series.push({ ...e, hl: "low", date: new Date(e.timestamp) })
                range.bid.low = { ...e, date: new Date(e.timestamp) }
            }
        }
    }
}

export function generateOppurtunities(range: Range): Oppurtunity[] {
    const oppurtinities: Oppurtunity[] = []
    const askSeriesLen = range.ask.series.length - 1
    const bidSeriesLen = range.bid.series.length - 1
    const maxOffset = Math.min(askSeriesLen, bidSeriesLen);
    for(let offset = 0; offset < maxOffset; offset++) {
        const ask1 = range.ask.series[askSeriesLen - 1 - offset];
        const ask2 = range.ask.series[askSeriesLen - offset];
        const bid1 = range.bid.series[bidSeriesLen - 1 - offset];
        const bid2 = range.bid.series[bidSeriesLen - offset];

        // preparations
        const lowAsk = ask1.hl === "low" ? ask1 : (ask2.hl === "low" ? ask2 : undefined);
        const highAsk = ask1.hl === "high" ? ask1 : (ask2.hl === "high" ? ask2 : undefined);
        const lowBid = bid1.hl === "low" ? bid1 : (bid2.hl === "low" ? bid2 : undefined);
        const highBid = bid1.hl === "high" ? bid1 : (bid2.hl === "high" ? bid2 : undefined);

        // buy
        if(lowBid && highBid) {
            const lowThenHigh = lowBid.timestamp < highBid.timestamp;
            const profitable = lowBid.ask < highBid.bid;
            if(lowThenHigh && profitable) {
                oppurtinities.push({ orderType: "BUY", enter: lowBid, high: highBid, low: lowBid })
            }
        }

        // sell
        if(highAsk && lowAsk) {
            const highThenLow = highAsk.timestamp < lowAsk.timestamp;
            const profitable = highAsk.bid > lowAsk.ask;
            if(highThenLow && profitable) {
                oppurtinities.push({ orderType: "SELL", enter: highAsk, high: highAsk, low: lowAsk })
            }
        }
    }

    return oppurtinities;
}

type RangeWithOptionalData = (Omit<Range, "ask" | "bid"> & {ask: Partial<Range["ask"]>, bid: Partial<Range["bid"]>});
function outputDefaultFormat(ranges: RangeWithOptionalData[], output: string): void {
    const out = fs.createWriteStream(output)
    for(const range of ranges) {
        delete range.ask.high;
        delete range.ask.low;
        delete range.bid.high;
        delete range.bid.low;
    }
    out.write(JSON.stringify(ranges, null, 2))
    out.end();
}

export default async function main(output: string, inputs: string[], range: string, period: string, symbolName: string) {
    const ranges: Range[] = []
    const spots = fromFiles({
        paths: inputs,
        symbol: Symbol.for(symbolName)
    });
    const trendbars = G.toTrendbars({
        period: ms(period),
        symbol: Symbol.for(symbolName),
        spots
    })
    const trendbarEvents: T.TrendbarEvent[] = []
    trendbars.on("data", e => {
        trendbarEvents.push(e);
        if (trendbarEvents.length >= 2) {
            const first = trendbarEvents.shift()!;
            const second = trendbarEvents[0];
            if (bullish(first) && engulfed(first, second)) {
                ranges.push(emptyRange(e.timestamp + ms(period), ranges.length.toString(), "BUY", [first, second], ms(range)))
            } else if (bearish(first) && engulfed(first, second)) {
                ranges.push(emptyRange(e.timestamp + ms(period), ranges.length.toString(), "SELL", [first, second], ms(range)))
            }
        }
    });
    spots.on("data", e => {
        if (e.type === "PRICE_CHANGED") {
            trackAskPrices(ranges, e);
            trackBidPrices(ranges, e);
        }
    })
    finished(spots, () => {
        for (const range of ranges) {
            range.oppurtunities = generateOppurtunities(range);
        }
        outputDefaultFormat(ranges, output);
    })
}