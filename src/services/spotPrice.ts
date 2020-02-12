import { EventEmitter } from "events"

import { Price, Timestamp } from "./types";

export interface AskPriceChangedEvent {
    symbol: Symbol,
    price: Price,
    timestamp: Timestamp
}
export interface BidPriceChangedEvent {
    symbol: Symbol,
    price: Price,
    timestamp: Timestamp
}
export interface PriceChangedEvent {
    symbol: Symbol,
    ask: Price,
    bid: Price,
    timestamp: Timestamp
}
export interface SpotPriceStream extends EventEmitter {
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
    addListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
    addListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
    on(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
    on(event: "price", listener: (e: PriceChangedEvent) => void): this;

    once(event: string, listener: (...args: any[]) => void): this;
    once(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
    once(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
    once(event: "price", listener: (e: PriceChangedEvent) => void): this;

    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
    prependListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
    prependListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
    prependOnceListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
    prependOnceListener(event: "price", listener: (e: PriceChangedEvent) => void): this;
}
