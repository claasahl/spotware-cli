import { EventEmitter } from "events"
import debug from "debug"

import { Price, Volume, Period, Timestamp, Symbol } from "./types";
import { SpotPricesStream, BidPriceChangedEvent } from "./spotPrices";

export interface TrendbarEvent {
    open: Price,
    high: Price,
    low: Price,
    close: Price,
    volume: Volume,
    timestamp: Timestamp
}

export interface TrendbarsProps {
    readonly symbol: Symbol
    readonly period: Period
}

export interface TrendbarsActions {
    // no actions, yet
}

export declare interface TrendbarsStream extends EventEmitter {
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

export class TrendbarsStream extends EventEmitter implements TrendbarsProps, TrendbarsActions {
    readonly symbol: Symbol;
    readonly period: Period;
    constructor(symbol: Symbol, period: Period) {
        super();
        this.symbol = symbol;
        this.period = period;
    }
}

export class DebugTrendbarsStream extends TrendbarsStream {
    constructor(symbol: Symbol, period: Period) {
        super(symbol, period)
        const log = debug("trendbars");

        const trendbar = log.extend("trendbar");
        this.prependListener("trendbar", e => trendbar("%j", e))
    }

    emitTrendbar(e: TrendbarEvent): void {
        setImmediate(() => this.emit("trendbar", e))
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
        next.open = curr.bid;
    }
    if(prev.high < curr.bid) {
        next.high = curr.bid;
    }
    if(prev.low > curr.bid) {
        next.low = curr.bid
    }
    next.close = curr.bid
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

export function from(spotPrice: SpotPricesStream, period: Period): TrendbarsStream {
    const bucked = (timestamp: Timestamp): Bucket => bucket(timestamp, period)
    const values : BidPriceChangedEvent[] = []
    const emitter = new TrendbarsStream(spotPrice.symbol, period);
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
