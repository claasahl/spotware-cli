import { Readable } from "stream";
import debug from "debug";

import { Price, Timestamp, Currency } from "./types";
import { OrderStream, MarketOrderProps, StopOrderProps, OrderEvent, OrderProps } from "./order";
import { SpotPricesStream, SpotPricesProps } from "./spotPrices";
import { TrendbarsProps, TrendbarsStream } from "./trendbars";

export interface BalanceChangedEvent {
  type: "BALANCE_CHANGED";
  balance: Price;
  timestamp: Timestamp;
}
export interface TransactionEvent {
  type: "TRANSACTION";
  amount: Price;
  timestamp: Timestamp;
}
export interface EquityChangedEvent {
  type: "EQUITY_CHANGED";
  equity: Price;
  timestamp: Timestamp;
}
export type OrderEvents = OrderEvent & OrderProps; // TODO revise/remove this
export type AccountSimpleMarketOrderProps = Omit<MarketOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleStopOrderProps = Omit<StopOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleSpotPricesProps = Omit<SpotPricesProps, keyof AccountProps>;
export type AccountSimpleTrendbarsProps = Omit<TrendbarsProps, keyof AccountProps>;
export type AccountEvent = BalanceChangedEvent | TransactionEvent | EquityChangedEvent | OrderEvents;
const accountEventTypes: AccountEvent['type'][] = ["BALANCE_CHANGED", "TRANSACTION", "EQUITY_CHANGED", "CREATED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELED", "FILLED", "PROFITLOSS", "CLOSED", "ENDED"]

export interface AccountProps {
  readonly currency: Currency;
}
export interface AccountActions {
  marketOrder(props: AccountSimpleMarketOrderProps): Promise<OrderStream<MarketOrderProps>>;
  stopOrder(props: AccountSimpleStopOrderProps): Promise<OrderStream<StopOrderProps>>;
  spotPrices(props: AccountSimpleSpotPricesProps): Promise<SpotPricesStream>;
  trendbars(props: AccountSimpleTrendbarsProps): Promise<TrendbarsStream>;
}
export declare interface AccountStream extends Readable {
  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (event: AccountEvent) => void): this;
  addListener(event: "end", listener: () => void): this;
  addListener(event: "readable", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  emit(event: "close"): boolean;
  emit(event: "data", chunk: any): boolean;
  emit(event: "end"): boolean;
  emit(event: "readable"): boolean;
  emit(event: "error", err: Error): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (event: AccountEvent) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (event: AccountEvent) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (event: AccountEvent) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (event: AccountEvent) => void): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (event: AccountEvent) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

export abstract class AccountStream extends Readable implements AccountActions {
  public readonly props: AccountProps;
  private readonly cachedEvents: Map<AccountEvent["type"], AccountEvent>;
  private readonly log: debug.Debugger;

  constructor(props: AccountProps) {
    super(streamConfig);
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
    this.log = debug("account");
  }

  push(event: AccountEvent | null): boolean {
    if (event && accountEventTypes.includes(event.type)) {
      this.cachedEvents.set(event.type, event);
      this.log("%j", event);
    }
    const tmp = super.push(event)
    if(event && event.type === "TRANSACTION") {
        const { timestamp, amount } = event;
        const balanceOrNull = this.balanceOrNull();
        const oldBalance = balanceOrNull ? balanceOrNull.balance : 0
        const balance = Math.round((oldBalance + amount) * 100) / 100;
        this.push({type: "BALANCE_CHANGED", timestamp, balance})
    }
    return tmp;
  }

  private cachedEvent<T extends AccountEvent>(type: T["type"]): Promise<T> {
    if (!accountEventTypes.includes(type)) {
      const error = new Error(`event type '${type}' is not allowed. Only ${accountEventTypes.join(", ")} as allowed.`)
      return Promise.reject(error);
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return Promise.resolve(event as T);
    } else {
      return new Promise(resolve => {
        const isEvent = (event: AccountEvent) => {
          if (event.type === type) {
            resolve(event as T);
            this.off("data", isEvent);
          }
        }
        this.on("data", isEvent);
        this.once("close", () => this.off("data", isEvent));
      });
    }
  }

  balance(): Promise<BalanceChangedEvent> {
    return this.cachedEvent("BALANCE_CHANGED");
  }

  equity(): Promise<EquityChangedEvent> {
    return this.cachedEvent("EQUITY_CHANGED");
  }

  transaction(): Promise<TransactionEvent> {
    return this.cachedEvent("TRANSACTION");
  }

  private cachedEventOrNull<T extends AccountEvent>(type: T["type"]): T | null {
    if (!accountEventTypes.includes(type)) {
      throw new Error(`event type '${type}' is not allowed. Only ${accountEventTypes.join(", ")} as allowed.`)
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return event as T;
    }
    return null;
  }

  balanceOrNull(): BalanceChangedEvent | null {
    return this.cachedEventOrNull("BALANCE_CHANGED");
  }

  equityOrNull(): EquityChangedEvent | null {
    return this.cachedEventOrNull("EQUITY_CHANGED");
  }

  transactionOrNull(): TransactionEvent | null {
    return this.cachedEventOrNull("TRANSACTION");
  }

  abstract marketOrder(props: AccountSimpleMarketOrderProps): Promise<OrderStream<MarketOrderProps>>;
  abstract stopOrder(props: AccountSimpleStopOrderProps): Promise<OrderStream<StopOrderProps>>;
  abstract spotPrices(props: AccountSimpleSpotPricesProps): Promise<SpotPricesStream>;
  abstract trendbars(props: AccountSimpleTrendbarsProps): Promise<TrendbarsStream>;
}

export class DebugAccountStream extends AccountStream {
  async marketOrder(_props: AccountSimpleMarketOrderProps): Promise<OrderStream<MarketOrderProps>> {
    throw new Error("not implemented");
  }
  async stopOrder(_props: AccountSimpleStopOrderProps): Promise<OrderStream<StopOrderProps>> {
    throw new Error("not implemented");
  }
  async spotPrices(_props: AccountSimpleSpotPricesProps): Promise<SpotPricesStream> {
    throw new Error("not implemented");
  }
  async trendbars(_props: AccountSimpleTrendbarsProps): Promise<TrendbarsStream> {
    throw new Error("not implemented");
  }

  tryBalance(e: Omit<BalanceChangedEvent, "type">): void {
    this.push({...e, type: "BALANCE_CHANGED"});
  }

  tryTransaction(e: Omit<TransactionEvent, "type">): void {
    this.push({...e, type: "TRANSACTION"});
  }

  tryEquity(e: Omit<EquityChangedEvent, "type">): void {
    this.push({...e, type: "EQUITY_CHANGED"});
  }

  tryOrder(e: OrderEvents): void {
    this.push(e);
  }
}
