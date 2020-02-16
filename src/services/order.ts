import { EventEmitter } from "events"
import debug from "debug"

import { Symbol, Timestamp } from "./types";

export interface OrderAcceptedEvent {
    timestamp: Timestamp
}
export interface OrderFilledEvent {
    timestamp: Timestamp
}
export interface OrderClosedEvent {
    timestamp: Timestamp
}
export interface OrderEndEvent {
    timestamp: Timestamp
}

export interface OderProps {
    readonly id: string;
    readonly symbol: Symbol;
}

export interface OrderActions {
    close(): this;
    cancel(): this;
    end(): this;
    amend(): this;
}

export declare interface OrderStream extends EventEmitter {
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
}

export abstract class OrderStream extends EventEmitter implements OderProps, OrderActions {
    readonly id: string;
    readonly symbol: Symbol;
    constructor(id: string, symbol: Symbol) {
        super();
        this.id = id;
        this.symbol = symbol;
    }

    abstract close(): this;
    abstract cancel(): this;
    abstract end(): this;
    abstract amend(): this;
}

export class DebugOrderStream extends OrderStream {
    constructor(id: string, symbol: Symbol) {
        super(id, symbol);
        const log = debug("order");
        
        const accepted = log.extend("accepted")
        this.prependListener("accepted", e => accepted("%j", e))

        const filled = log.extend("filled")
        this.prependListener("filled", e => filled("%j", e))

        const closed = log.extend("closed")
        this.prependListener("closed", e => closed("%j", e))

        const end = log.extend("end")
        this.prependListener("end", e => end("%j", e))
    }

    close(): this {
        throw new Error("not implemented")
    }
    cancel(): this {
        throw new Error("not implemented")
    }
    end(): this {
        throw new Error("not implemented")
    }
    amend(): this {
        throw new Error("not implemented")
    }

    emitAccepted(e: OrderAcceptedEvent): void {
        setImmediate(() => this.emit("accepted", e))
    }

    emitFilled(e: OrderFilledEvent): void {
        setImmediate(() => this.emit("filled", e))
    }

    emitClosed(e: OrderClosedEvent): void {
        setImmediate(() => this.emit("closed", e))
    }

    emitEnd(e: OrderEndEvent): void {
        setImmediate(() => this.emit("end", e))
    }
}