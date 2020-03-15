import { EventEmitter } from "events";
import debug from "debug";

import { Price, Timestamp, Currency } from "./types";
import { OrderStream, OrderProps } from "./order";
import { SpotPricesStream, SpotPricesProps } from "./spotPrices";

export interface BalanceChangedEvent {
  balance: Price;
  timestamp: Timestamp;
}
export interface EquityChangedEvent {
  equity: Price;
  timestamp: Timestamp;
}
export interface OrderEvent {
  timestamp: Timestamp;
}
export type SimpleOrderProps = Omit<OrderProps, keyof AccountProps>;
export type SimpleSpotPricesProps = Omit<SpotPricesProps, keyof AccountProps>;
export interface AccountProps {
  readonly currency: Currency;
}
export interface AccountActions {
  order(props: SimpleOrderProps): OrderStream;
  spotPrices(props: SimpleSpotPricesProps): SpotPricesStream;
}
export declare interface AccountStream extends EventEmitter {
  balance(cb: (e: BalanceChangedEvent) => void): void
  equity(cb: (e: EquityChangedEvent) => void): void

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

export abstract class AccountStream extends EventEmitter
  implements AccountProps, AccountActions {
  readonly currency: Currency;
  private cachedBalance?: BalanceChangedEvent;
  private cachedEquity?: EquityChangedEvent;
  constructor(props: AccountProps) {
    super();
    this.currency = props.currency;
    this.on("balance", e => this.cachedBalance = e)
    this.on("equity", e => this.cachedEquity = e)
  }

  balance(cb: (e: BalanceChangedEvent) => void): void {
    setImmediate(() => {
      if(this.cachedBalance) {
        cb(this.cachedBalance);
      } else {
        this.once("balance", cb)
      }
    })
  }

  equity(cb: (e: EquityChangedEvent) => void): void {
    setImmediate(() => {
      if(this.cachedEquity) {
        cb(this.cachedEquity);
      } else {
        this.once("equity", cb)
      }
    })
  }

  abstract order(props: SimpleOrderProps): OrderStream;
  abstract spotPrices(props: SimpleSpotPricesProps): SpotPricesStream;
}

export class DebugAccountStream extends AccountStream {
  constructor(props: AccountProps) {
    super(props);
    const log = debug("account");

    const balance = log.extend("balance");
    this.prependListener("balance", e => balance("%j", e));

    const equity = log.extend("equity");
    this.prependListener("equity", e => equity("%j", e));

    const order = log.extend("order");
    this.prependListener("order", e => order("%j", e));
  }
  order(_props: SimpleOrderProps): OrderStream {
    throw new Error("not implemented");
  }
  spotPrices(_props: SimpleSpotPricesProps): SpotPricesStream {
    throw new Error("not implemented");
  }

  emitBalance(e: BalanceChangedEvent): void {
    setImmediate(() => this.emit("balance", e));
  }

  emitEquity(e: EquityChangedEvent): void {
    setImmediate(() => this.emit("equity", e));
  }

  emitOrder(e: OrderEvent): void {
    setImmediate(() => this.emit("order", e));
  }
}
