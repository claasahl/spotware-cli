import { Readable } from "stream";
import debug from "debug";
import { createMachine, StateMachine } from '@xstate/fsm';

import { Symbol, Timestamp, TradeSide, Volume, Price, OrderType } from "./types";

export interface OrderCreatedEvent {
  type: "CREATED";
  timestamp: Timestamp;
}
export interface OrderAcceptedEvent {
  type: "ACCEPTED";
  timestamp: Timestamp;
}
export interface OrderRejectedEvent {
  type: "REJECTED";
  timestamp: Timestamp;
}
export interface OrderCanceledEvent {
  type: "CANCELED";
  timestamp: Timestamp;
}
export interface OrderExpiredEvent {
  type: "EXPIRED";
  timestamp: Timestamp;
}
export interface OrderFilledEvent {
  type: "FILLED";
  timestamp: Timestamp;
  entry: Price;
}
export interface OrderProfitLossEvent {
  type: "PROFITLOSS";
  timestamp: Timestamp;
  price: Price;
  profitLoss: Price;
}
export interface OrderClosedEvent {
  type: "CLOSED";
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
}
export type OrderEndedEvent = {
  type: "ENDED";
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
} | {
  type: "ENDED";
  timestamp: Timestamp;
}
export type OrderEvent = OrderCreatedEvent | OrderAcceptedEvent | OrderRejectedEvent | OrderExpiredEvent | OrderCanceledEvent | OrderFilledEvent | OrderProfitLossEvent | OrderClosedEvent | OrderEndedEvent;
const orderEventTypes: OrderEvent["type"][] = ["CREATED", "ACCEPTED", "REJECTED", "CANCELED", "EXPIRED", "FILLED", "PROFITLOSS", "CLOSED", "ENDED"]

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

type Context = {}

type Event =
  | { type: 'CREATE', event: OrderCreatedEvent }
  | { type: 'ACCEPT', event: OrderAcceptedEvent }
  | { type: 'REJECT', event: OrderRejectedEvent }
  | { type: 'FILL', event: OrderFilledEvent }
  | { type: 'PROFITLOSS', event: OrderProfitLossEvent }
  | { type: 'CLOSE', event: OrderClosedEvent }
  | { type: 'CANCEL', event: OrderCanceledEvent }
  | { type: 'EXPIRE', event: OrderExpiredEvent }

type State =
  | { value: 'uninitialized', context: {} }
  | { value: 'created', context: {} }
  | { value: 'accepted', context: {} }
  | { value: 'rejected', context: {} }
  | { value: 'filled', context: {} }
  | { value: 'closed', context: {} }
  | { value: 'canceled', context: {} }
  | { value: 'expired', context: {} }

const machine = createMachine<Context, Event, State>({
  initial: "uninitialized",
  states: {
    uninitialized: {
      on: {
        CREATE: 'created'
      }
    },
    created: {
      on: {
        ACCEPT: 'accepted',
        REJECT: 'rejected',
        CANCEL: 'canceled'
      }
    },
    accepted: {
      on: {
        FILL: 'filled',
        CANCEL: 'canceled',
        EXPIRE: 'expired'
      }
    },
    filled: {
      on: {
        CLOSE: 'closed',
        PROFITLOSS: 'filled'
      }
    },
    rejected: {},
    closed: {},
    canceled: {},
    expired: {},
  }
});

export abstract class OrderStream<Props extends OrderProps> extends Readable implements OrderActions {
  public readonly props: Props
  private readonly cachedEvents: Map<OrderEvent["type"], OrderEvent>;
  private readonly log: debug.Debugger;
  protected state: StateMachine.State<Context, Event, State>;

  constructor(props: Props) {
    super({ objectMode: true, read: () => { } });
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
    this.log = debug("order").extend(props.id);
    this.state = machine.initialState
  }

  push(event: OrderEvent): boolean {
    if (orderEventTypes.includes(event.type)) {
      this.cachedEvents.set(event.type, event);
      this.log("%j", event);
    }
    return super.push(event)
  }

  private cachedEvent<T extends OrderEvent>(type: T["type"]): Promise<T> {
    if (!orderEventTypes.includes(type)) {
      const error = new Error(`event type '${type}' is not allowed. Only ${orderEventTypes.join(", ")} as allowed.`)
      return Promise.reject(error);
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return Promise.resolve(event as T);
    } else {
      return new Promise(resolve => {
        const isEvent = (event: OrderEvent) => {
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
    return this.cachedEvent("ENDED");
  }

  abstract close(): Promise<OrderClosedEvent>;
  abstract cancel(): Promise<OrderCanceledEvent>;
  abstract end(): Promise<OrderEndedEvent>;

  protected event(e: Event) {
    const oldState = this.state;
    const newState = machine.transition(oldState, e);
    this.state = newState;

    if (newState.changed && e.type === "CREATE") {
      this.push(e.event)
    } else if (newState.changed && e.type === "ACCEPT") {
      this.push(e.event)
    } else if (newState.changed && e.type === "FILL") {
      this.push(e.event)
    } else if (newState.value === "filled" && e.type === "PROFITLOSS") {
      this.push(e.event)
    } else if (newState.changed && e.type === "REJECT") {
      this.push(e.event)
      this.push({ ...e.event, type: "ENDED" })
    } else if (newState.changed && e.type === "CLOSE") {
      this.push(e.event)
      this.push({ ...e.event, type: "ENDED" })
    } else if (newState.changed && e.type === "CANCEL") {
      this.push(e.event)
      this.push({ ...e.event, type: "ENDED" })
    } else if (newState.changed && e.type === "EXPIRE") {
      this.push(e.event)
      this.push({ ...e.event, type: "ENDED" })
    }
  }
}
export class DebugOrderStream<Props extends OrderProps> extends OrderStream<Props> {

  async close(): Promise<OrderClosedEvent> {
    throw new Error("not implemented");
  }
  async cancel(): Promise<OrderCanceledEvent> {
    throw new Error("not implemented");
  }
  async end(): Promise<OrderEndedEvent> {
    throw new Error("not implemented");
  }

  tryCreate(e: Omit<OrderCreatedEvent, "type">): void {
    this.event({ type: "CREATE", event: { ...e, type: "CREATED" } })
  }

  tryAccept(e: Omit<OrderAcceptedEvent, "type">): void {
    this.event({ type: "ACCEPT", event: { ...e, type: "ACCEPTED" } })
  }

  tryReject(e: Omit<OrderRejectedEvent, "type">): void {
    this.event({ type: "REJECT", event: { ...e, type: "REJECTED" } })
  }

  tryFill(e: Omit<OrderFilledEvent, "type">): void {
    this.event({ type: "FILL", event: { ...e, type: "FILLED" } })
  }

  tryProfitLoss(e: Omit<OrderProfitLossEvent, "type">): void {
    this.event({ type: "PROFITLOSS", event: { ...e, type: "PROFITLOSS" } })
  }

  tryClose(e: Omit<OrderClosedEvent, "type">): void {
    this.event({ type: "CLOSE", event: { ...e, type: "CLOSED" } })
  }

  tryCancel(e: Omit<OrderCanceledEvent, "type">): void {
    this.event({ type: "CANCEL", event: { ...e, type: "CANCELED" } })
  }

  tryExpire(e: Omit<OrderExpiredEvent, "type">): void {
    this.event({ type: "EXPIRE", event: { ...e, type: "EXPIRED" } })
  }
}
