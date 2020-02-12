import { EventEmitter } from "events"
import { Price, Volume, Period, Timestamp, Symbol } from "./types";

export interface TrendbarEvent {
    symbol: Symbol,
    open: Price,
    high: Price,
    low: Price,
    close: Price,
    volume: Volume,
    period: Period
    timestamp: Timestamp
}

export interface TrendbarStream extends EventEmitter {
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
