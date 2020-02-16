import debug from "debug"

import {AccountStream as Base, BalanceChangedEvent, EquityChangedEvent, OrderEvent} from "../account"
import { OrderStream } from "../order";
import { Symbol } from "../types";

export class Account extends Base {
    order(_symbol: Symbol): OrderStream {
        throw new Error("not implemented")
    }
}
export class DebugAccount extends Base {
    private readonly log = debug("debugAccount")
    constructor() {
        super();
        this.prependListener("balance", e => this.log("%j", {...e, event: "balance"}))
        this.prependListener("equity", e => this.log("%j", {...e, event: "equity"}))
        this.prependListener("order", e => this.log("%j", {...e, event: "order"}))
    }
    order(_symbol: Symbol): OrderStream {
        throw new Error("not implemented")
    }

    emitBalance(e: BalanceChangedEvent): void {
        setImmediate(() => this.emit("balance", e))
    }

    emitEquity(e: EquityChangedEvent): void {
        setImmediate(() => this.emit("equity", e))
    }

    emitOrder(e: OrderEvent): void {
        setImmediate(() => this.emit("order", e))
    }
}