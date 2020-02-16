import { EventEmitter } from "events"
import debug from "debug"

import { Price, Timestamp, Symbol } from "./types";

export interface AskPriceChangedEvent {
    price: Price,
    timestamp: Timestamp
}
export interface BidPriceChangedEvent {
    price: Price,
    timestamp: Timestamp
}
export interface PriceChangedEvent {
    ask: Price,
    bid: Price,
    timestamp: Timestamp
}

export interface SpotPricesProps {
    readonly symbol: Symbol
}

export interface SpotPricesActions {
    // no actions, yet
}

export declare interface SpotPricesStream extends EventEmitter {
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

export class SpotPricesStream extends EventEmitter implements SpotPricesProps, SpotPricesActions {
    readonly symbol: Symbol;
    constructor(symbol: Symbol) {
        super();
        this.symbol = symbol;
    }
}

export class DebugSpotPricesStream extends SpotPricesStream {
    constructor(symbol: Symbol) {
        super(symbol)
        const log = debug("spotPrices");

        const ask = log.extend("ask")
        this.prependListener("ask", e => ask("%j", e))
        
        const bid = log.extend("bid")
        this.prependListener("bid", e => bid("%j", e))

        const price = log.extend("price")
        this.prependListener("price", e => price("%j", e))
    }

    emitAsk(e: AskPriceChangedEvent): void {
        setImmediate(() => this.emit("ask", e))
    }

    emitBid(e: BidPriceChangedEvent): void {
        setImmediate(() => this.emit("bid", e))
    }

    emitPrice(e: PriceChangedEvent): void {
        setImmediate(() => this.emit("price", e))
    }
}