import { EventEmitter } from "events";
import debug from "debug"

import { Price, Timestamp, Symbol } from "./types";
import { OrderStream } from "./order";
import { SpotPricesStream } from "./spotPrices";

export interface BalanceChangedEvent {
  balance: Price
  timestamp: Timestamp
}
export interface EquityChangedEvent {
  equity: Price
  timestamp: Timestamp
}
export interface OrderEvent {
  timestamp: Timestamp
}

export interface AccountProps {
  // no props, yet
}
export interface AccountActions {
  order(symbol: Symbol): OrderStream;
  spotPrices(symbol: Symbol): SpotPricesStream;
}
export declare interface AccountStream extends EventEmitter {
  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  addListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  addListener(event: "order", listener: (e: OrderEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  on(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  on(event: "order", listener: (e: OrderEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  once(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  once(event: "order", listener: (e: OrderEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  prependListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  prependListener(event: "order", listener: (e: OrderEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  prependOnceListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  prependOnceListener(event: "order", listener: (e: OrderEvent) => void): this;
}

export abstract class AccountStream extends EventEmitter implements AccountProps, AccountActions {
  abstract order(symbol: Symbol): OrderStream;
  abstract spotPrices(symbol: Symbol): SpotPricesStream;
}

export class DebugAccountStream extends AccountStream {
  constructor() {
    super();
    const log = debug("account")
    
    const balance = log.extend("balance")
    this.prependListener("balance", e => balance("%j", e))

    const equity = log.extend("equity")
    this.prependListener("equity", e => equity("%j", e))

    const order = log.extend("order")
    this.prependListener("order", e => order("%j", e))
  }
  order(_symbol: Symbol): OrderStream {
      throw new Error("not implemented")
  }
  spotPrices(_symbol: Symbol): SpotPricesStream {
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