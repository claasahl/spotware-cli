import { EventEmitter } from "events"
import { Price, Volume, Period, Timestamp, Symbol, EURUSD } from "./types";
import { SpotPriceStream, BidPriceChangedEvent } from "./spotPrice";

export interface TrendbarEvent {
    open: Price,
    high: Price,
    low: Price,
    close: Price,
    volume: Volume,
    timestamp: Timestamp
}

export interface TrendbarStream extends EventEmitter {
    readonly symbol: Symbol
    readonly period: Period

    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

    once(event: string, listener: (...args: any[]) => void): this;
    once(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;
}

export class Trendbars extends EventEmitter implements TrendbarStream {
    readonly symbol: Symbol;
    readonly period: Period;
    constructor(symbol: Symbol, period: Period) {
        super();
        this.symbol = symbol;
        this.period = period;
    }
}

interface Bucket {
    begin: Timestamp,
    end: Timestamp
}
function bucket(timestamp: Timestamp, period: Period): Bucket {
    const millisPerBucket = period;
    const bucketNo = Math.floor(timestamp / millisPerBucket);
    const begin = bucketNo * millisPerBucket;
    const end = begin + millisPerBucket
    return {begin, end}
}

function accumulateTrendbar(prev: TrendbarEvent, curr: BidPriceChangedEvent, index: number): TrendbarEvent {
    const next = {...prev}
    if(index === 0) {
        next.open = curr.price;
    }
    if(prev.high < curr.price) {
        next.high = curr.price;
    }
    if(prev.low > curr.price) {
        next.low = curr.price
    }
    next.close = curr.price
    return next;
}

function toTrendbar(timestamp: Timestamp, events: BidPriceChangedEvent[]): TrendbarEvent {
    const seed: TrendbarEvent = {
        open: 0,
        high: Number.MIN_VALUE,
        low: Number.MAX_VALUE,
        close: 0,
        timestamp,
        volume: 0
    }
    return events.reduce(accumulateTrendbar, seed)
}

export function from(spotPrice: SpotPriceStream, period: Period): TrendbarStream {
    const bucked = (timestamp: Timestamp): Bucket => bucket(timestamp, period)
    const values : BidPriceChangedEvent[] = []
    const emitter = new Trendbars(spotPrice.symbol, period);
    spotPrice.on("bid", e => {
        setImmediate(() => {
            values.push(e);
            const bucket1 = bucked(values[0].timestamp);
            const bucket2 = bucked(values[values.length-1].timestamp);
            if(bucket1.begin !== bucket2.begin) {
                const eventsInBucket = values.filter(e => bucked(e.timestamp).begin === bucket1.begin)
                values.splice(0, eventsInBucket.length);
                emitter.emit("trendbar", toTrendbar(bucket1.begin, eventsInBucket))
            }
        })
    })
    return emitter;
}

class P extends EventEmitter implements SpotPriceStream {
    symbol = EURUSD
}
const spotPrice = new P()
setImmediate(() => {
    spotPrice.emit("bid", {symbol: EURUSD, price: 2, timestamp: 0})
    spotPrice.emit("bid", {symbol: EURUSD, price: 1, timestamp: 10000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 0, timestamp: 20000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 5, timestamp: 30000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 4, timestamp: 40000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 3, timestamp: 50000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 6, timestamp: 60000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 7, timestamp: 70000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 8, timestamp: 80000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 9, timestamp: 90000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 10, timestamp: 100000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 11, timestamp: 110000})
    spotPrice.emit("bid", {symbol: EURUSD, price: 12, timestamp: 120000})
})
const trendbar = from(spotPrice, 60000)
trendbar.on("trendbar", console.log)