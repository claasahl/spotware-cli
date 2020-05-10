import { Readable } from "stream";
import debug from "debug";

import { Symbol, Timestamp, TradeSide, Volume, Price, OrderType } from "./types";

interface OrderCreatedEvent {
  type: "CREATED";
  timestamp: Timestamp;
}
interface OrderAcceptedEvent {
  type: "ACCEPTED";
  timestamp: Timestamp;
}
interface OrderRejectedEvent {
  type: "REJECTED";
  timestamp: Timestamp;
}
interface OrderCanceledEvent {
  type: "CANCELED";
  timestamp: Timestamp;
}
interface OrderExpiredEvent {
  type: "EXPIRED";
  timestamp: Timestamp;
}
interface OrderFilledEvent {
  type: "FILLED";
  timestamp: Timestamp;
  entry: Price;
}
interface OrderProfitLossEvent {
  type: "PROFITLOSS";
  timestamp: Timestamp;
  price: Price;
  profitLoss: Price;
}
interface OrderClosedEvent {
  type: "CLOSED";
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
}
type OrderEvent = OrderCreatedEvent | OrderAcceptedEvent | OrderRejectedEvent | OrderExpiredEvent | OrderCanceledEvent | OrderFilledEvent | OrderProfitLossEvent | OrderClosedEvent;
type OrderEndedEvent = OrderClosedEvent | OrderCanceledEvent | OrderExpiredEvent;
const orderEventTypes: OrderEvent["type"][] = ["CREATED", "ACCEPTED", "REJECTED", "CANCELED", "EXPIRED", "FILLED", "PROFITLOSS", "CLOSED"]

interface CommonOrderProps {
  readonly id: string;
  readonly symbol: Symbol;
  readonly tradeSide: TradeSide;
  readonly volume: Volume;
  readonly takeProfit?: Price;
  readonly stopLoss?: Price;
  readonly orderType: OrderType
  readonly expiresAt?: Timestamp
}

export interface MarketOrderProps extends CommonOrderProps {
  readonly orderType: "MARKET"
}
export interface StopOrderProps extends CommonOrderProps {
  readonly orderType: "STOP"
  readonly enter: Price;
}
export type OrderProps = MarketOrderProps | StopOrderProps

export interface OrderActions {
  close(): Promise<OrderClosedEvent>;
  cancel(): Promise<OrderCanceledEvent>;
  end(): Promise<OrderEndedEvent>;
}

export declare interface OrderStream<Props extends OrderProps> extends Readable {
  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (event: OrderEvent) => void): this;
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
  on(event: "data", listener: (event: OrderEvent) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (event: OrderEvent) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (event: OrderEvent) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (event: OrderEvent) => void): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (event: OrderEvent) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

export abstract class OrderStream<Props extends OrderProps> extends Readable implements OrderActions {
  public readonly props: Props
  private readonly cachedEvents: Map<OrderEvent["type"], OrderEvent>;
  private readonly log: debug.Debugger;

  constructor(props: Props) {
    super({ objectMode: true });
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
    this.log = debug("order").extend(props.id);
  }

  push(event: OrderEvent): boolean {
    if(orderEventTypes.includes(event.type)) {
      this.cachedEvents.set(event.type, event);
      this.log("%j", event);
    }
    return super.push(event)
  }

  private cachedEvent<T extends OrderEvent>(type: T["type"]): Promise<T> {
    if(orderEventTypes.includes(type)) {
      const error = new Error(`event type '${type}' is not allowed. Only ${orderEventTypes.join(", ")} as allowed.`)
      return Promise.reject(error);
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return Promise.resolve(event as T);
    } else {
      return new Promise(resolve => {
        const isEvent = (event: OrderEvent) => {
          if(event.type === type) {
            resolve(event as T);
            this.off("data", isEvent);
          }
        }
        this.on("data", isEvent);
        this.once("close", () => this.off("data", isEvent));
      });
    }
  }

  created(): Promise<OrderCreatedEvent> {
    return this.cachedEvent("CREATED");
  }

  accepted(): Promise<OrderAcceptedEvent> {
    return this.cachedEvent("ACCEPTED");
  }

  rejected(): Promise<OrderRejectedEvent> {
    return this.cachedEvent("REJECTED");
  }

  filled(): Promise<OrderFilledEvent> {
    return this.cachedEvent("FILLED");
  }

  profitLoss(): Promise<OrderProfitLossEvent> {
    return this.cachedEvent("PROFITLOSS");
  }

  closed(): Promise<OrderClosedEvent> {
    return this.cachedEvent("CLOSED");
  }

  canceled(): Promise<OrderCanceledEvent> {
    return this.cachedEvent("CANCELED");
  }

  expired(): Promise<OrderExpiredEvent> {
    return this.cachedEvent("EXPIRED");
  }

  ended(): Promise<OrderEndedEvent> {
    return Promise.race([
      this.cachedEvent<OrderClosedEvent>("CLOSED"),
      this.cachedEvent<OrderCanceledEvent>("CANCELED"),
      this.cachedEvent<OrderExpiredEvent>("EXPIRED")
    ]);
  }

  abstract close(): Promise<OrderClosedEvent>;
  abstract cancel(): Promise<OrderCanceledEvent>;
  abstract end(): Promise<OrderEndedEvent>;
}
