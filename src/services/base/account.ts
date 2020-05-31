import { Readable } from "stream";
import debug from "debug";

import { Price, Timestamp, Currency, GenericReadable } from "./types";
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
export interface AccountStream extends GenericReadable<AccountEvent>, AccountActions {
  readonly props: AccountProps;
}

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

abstract class AccountStreamBase extends Readable implements AccountStream {
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
        this.push({timestamp, type: "BALANCE_CHANGED", balance})
    }
    return tmp;
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

export class DebugAccountStream extends AccountStreamBase {
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
    const event: BalanceChangedEvent = {...e, type: "BALANCE_CHANGED"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }

  tryTransaction(e: Omit<TransactionEvent, "type">): void {
    const event: TransactionEvent = {...e, type: "TRANSACTION"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }

  tryEquity(e: Omit<EquityChangedEvent, "type">): void {
    const event: EquityChangedEvent = {...e, type: "EQUITY_CHANGED"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }

  tryOrder(e: OrderEvents): void {
    this.push({timestamp: e.timestamp, type: e.type, ...e});
  }
}
