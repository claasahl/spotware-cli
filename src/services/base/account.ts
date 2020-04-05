import { EventEmitter } from "events";
import debug from "debug";

import { Price, Timestamp, Currency } from "./types";
import { OrderStream, MarketOrderProps, StopOrderProps, OrderProps } from "./order";
import { SpotPricesStream, SpotPricesProps } from "./spotPrices";
import { TrendbarsProps, TrendbarsStream } from "./trendbars";

export interface BalanceChangedEvent {
  balance: Price;
  timestamp: Timestamp;
}
export interface TransactionEvent {
  amount: Price;
  timestamp: Timestamp;
}
export interface EquityChangedEvent {
  equity: Price;
  timestamp: Timestamp;
}
interface OrderEventBase {
  timestamp: Timestamp;
  status: "CREATED" | "ACCEPTED" | "REJECTED" | "CANCELED" | "FILLED" | "CLOSED" | "ENDED"
}
export type OrderEvent = OrderProps & OrderEventBase
export type AccountSimpleMarketOrderProps = Omit<MarketOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleStopOrderProps = Omit<StopOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleSpotPricesProps = Omit<SpotPricesProps, keyof AccountProps>;
export type AccountSimpleTrendbarsProps = Omit<TrendbarsProps, keyof AccountProps>;
export interface AccountProps {
  readonly currency: Currency;
}
export interface AccountActions {
  marketOrder(props: AccountSimpleMarketOrderProps): OrderStream<MarketOrderProps>;
  stopOrder(props: AccountSimpleStopOrderProps): OrderStream<StopOrderProps>;
  spotPrices(props: AccountSimpleSpotPricesProps): SpotPricesStream;
  trendbars(props: AccountSimpleTrendbarsProps): TrendbarsStream;
}
export declare interface AccountStream extends EventEmitter {
  balance(cb: (e: BalanceChangedEvent) => void): void
  transaction(cb: (e: TransactionEvent) => void): void
  equity(cb: (e: EquityChangedEvent) => void): void
  order(cb: (e: OrderEvent) => void): void

  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  addListener(event: "transaction", listener: (e: TransactionEvent) => void): this;
  addListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  addListener(event: "order", listener: (e: OrderEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  on(event: "transaction", listener: (e: TransactionEvent) => void): this;
  on(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  on(event: "order", listener: (e: OrderEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  once(event: "transaction", listener: (e: TransactionEvent) => void): this;
  once(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  once(event: "order", listener: (e: OrderEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  prependListener(event: "transaction", listener: (e: TransactionEvent) => void): this;
  prependListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  prependListener(event: "order", listener: (e: OrderEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
  prependOnceListener(event: "transaction", listener: (e: TransactionEvent) => void): this;
  prependOnceListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
  prependOnceListener(event: "order", listener: (e: OrderEvent) => void): this;
}

export abstract class AccountStream extends EventEmitter implements AccountActions {
  public readonly props: AccountProps;
  private cachedBalance?: BalanceChangedEvent;
  private cachedTransaction?: TransactionEvent;
  private cachedEquity?: EquityChangedEvent;
  private cachedOrder?: OrderEvent;
  constructor(props: AccountProps) {
    super();
    this.props = Object.freeze(props);
    this.on("balance", e => this.cachedBalance = e)
    this.on("transaction", e => this.cachedTransaction = e)
    this.on("equity", e => this.cachedEquity = e)
    this.on("order", e => this.cachedOrder = e)
    this.on("transaction", e => {
      setImmediate(() => {
        const {timestamp, amount} = e;
        const oldBalance = this.cachedBalance ? this.cachedBalance.balance : 0;
        const balance = Math.round((oldBalance + amount) * 100) / 100;
        this.emit("balance", {timestamp, balance})
      })
  })
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

  transaction(cb: (e: TransactionEvent) => void): void {
    setImmediate(() => {
      if(this.cachedTransaction) {
        cb(this.cachedTransaction);
      } else {
        this.once("transaction", cb)
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

  order(cb: (e: OrderEvent) => void): void {
    setImmediate(() => {
      if(this.cachedOrder) {
        cb(this.cachedOrder);
      } else {
        this.once("order", cb)
      }
    })
  }

  abstract marketOrder(props: AccountSimpleMarketOrderProps): OrderStream<MarketOrderProps>;
  abstract stopOrder(props: AccountSimpleStopOrderProps): OrderStream<StopOrderProps>;
  abstract spotPrices(props: AccountSimpleSpotPricesProps): SpotPricesStream;
  abstract trendbars(props: AccountSimpleTrendbarsProps): TrendbarsStream;
}

export class DebugAccountStream extends AccountStream {
  constructor(props: AccountProps) {
    super(props);
    const log = debug("account");

    const balance = log.extend("balance");
    this.prependListener("balance", e => balance("%j", e));

    const transaction = log.extend("transaction");
    this.prependListener("transaction", e => transaction("%j", e));

    const equity = log.extend("equity");
    this.prependListener("equity", e => equity("%j", e));

    const order = log.extend("order");
    this.prependListener("order", e => order("%j", e));
  }
  marketOrder(_props: AccountSimpleMarketOrderProps): OrderStream<MarketOrderProps> {
    throw new Error("not implemented");
  }
  stopOrder(_props: AccountSimpleStopOrderProps): OrderStream<StopOrderProps> {
    throw new Error("not implemented");
  }
  spotPrices(_props: AccountSimpleSpotPricesProps): SpotPricesStream {
    throw new Error("not implemented");
  }
  trendbars(_props: AccountSimpleSpotPricesProps): TrendbarsStream {
    throw new Error("not implemented");
  }

  emitBalance(e: BalanceChangedEvent): void {
    setImmediate(() => this.emit("balance", e));
  }

  emitTransaction(e: TransactionEvent): void {
    setImmediate(() => this.emit("transaction", e));
  }

  emitEquity(e: EquityChangedEvent): void {
    setImmediate(() => this.emit("equity", e));
  }

  emitOrder(e: OrderEvent): void {
    setImmediate(() => this.emit("order", e));
  }
}
