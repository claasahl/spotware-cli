import { EventEmitter } from "events"

import { Symbol, Timestamp } from "./types";

export interface OrderAcceptedEvent {
    symbol: Symbol,
    timestamp: Timestamp
}
export interface OrderFilledEvent {
    symbol: Symbol,
    timestamp: Timestamp
}
export interface OrderClosedEvent {
    symbol: Symbol,
    timestamp: Timestamp
}
export interface OrderEndEvent {
    symbol: Symbol,
    timestamp: Timestamp
}
export interface OrderStream extends EventEmitter {
    readonly id: string;

    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
    addListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
    addListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
    addListener(event: "end", listener: (e: OrderEndEvent) => void): this;

    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
    on(event: "filled", listener: (e: OrderFilledEvent) => void): this;
    on(event: "closed", listener: (e: OrderClosedEvent) => void): this;
    on(event: "end", listener: (e: OrderEndEvent) => void): this;

    once(event: string, listener: (...args: any[]) => void): this;
    once(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
    once(event: "filled", listener: (e: OrderFilledEvent) => void): this;
    once(event: "closed", listener: (e: OrderClosedEvent) => void): this;
    once(event: "end", listener: (e: OrderEndEvent) => void): this;

    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
    prependListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
    prependListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
    prependListener(event: "end", listener: (e: OrderEndEvent) => void): this;

    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
    prependOnceListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
    prependOnceListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
    prependOnceListener(event: "end", listener: (e: OrderEndEvent) => void): this;

    close(): this;
    cancel(): this;
    end(): this;
    amend(): this;
}