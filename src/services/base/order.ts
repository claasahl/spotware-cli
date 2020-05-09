import { EventEmitter } from "events";
import debug from "debug";

import { Symbol, Timestamp, TradeSide, Volume, Price, OrderType } from "./types";

export interface OrderCreatedEvent {
  timestamp: Timestamp;
}
export interface OrderAcceptedEvent {
  timestamp: Timestamp;
}
export interface OrderRejectedEvent {
  timestamp: Timestamp;
}
export interface OrderCanceledEvent {
  timestamp: Timestamp;
}

export interface OrderExpiredEvent {
  timestamp: Timestamp;
}
export interface OrderFilledEvent {
  timestamp: Timestamp;
  entry: Price;
}
export interface OrderProfitLossEvent {
  timestamp: Timestamp;
  price: Price;
  profitLoss: Price;
}
export interface OrderClosedEvent {
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
}
export type OrderEndedEvent = OrderClosedEvent | OrderCanceledEvent | OrderExpiredEvent;

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
  close(): OrderClosedEvent;
  cancel(): OrderCanceledEvent;
  end(): OrderEndedEvent;
}

export declare interface OrderStream<Props extends OrderProps> extends EventEmitter {
  created(): Promise<OrderCreatedEvent>;
  accepted(): Promise<OrderAcceptedEvent>;
  rejected(): Promise<OrderAcceptedEvent>;
  filled(): Promise<OrderFilledEvent>;
  profitLoss(): Promise<OrderProfitLossEvent>
  closed(): Promise<OrderClosedEvent>
  canceled(): Promise<OrderCanceledEvent>
  expired(): Promise<OrderExpiredEvent>
  ended(): Promise<OrderEndedEvent>

  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "created", listener: (e: OrderCreatedEvent) => void): this;
  addListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  addListener(event: "rejected", listener: (e: OrderRejectedEvent) => void): this;
  addListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  addListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  addListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  addListener(event: "canceled", listener: (e: OrderCanceledEvent) => void): this;
  addListener(event: "expired", listener: (e: OrderExpiredEvent) => void): this;
  addListener(event: "ended", listener: (e: OrderEndedEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "created", listener: (e: OrderCreatedEvent) => void): this;
  on(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  on(event: "rejected", listener: (e: OrderRejectedEvent) => void): this;
  on(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  on(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  on(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  on(event: "canceled", listener: (e: OrderCanceledEvent) => void): this;
  on(event: "expired", listener: (e: OrderExpiredEvent) => void): this;
  on(event: "ended", listener: (e: OrderEndedEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "created", listener: (e: OrderCreatedEvent) => void): this;
  once(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  once(event: "rejected", listener: (e: OrderRejectedEvent) => void): this;
  once(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  once(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  once(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  once(event: "canceled", listener: (e: OrderCanceledEvent) => void): this;
  once(event: "expired", listener: (e: OrderExpiredEvent) => void): this;
  once(event: "ended", listener: (e: OrderEndedEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "created", listener: (e: OrderCreatedEvent) => void): this;
  prependListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  prependListener(event: "rejected", listener: (e: OrderRejectedEvent) => void): this;
  prependListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  prependListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  prependListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  prependListener(event: "canceled", listener: (e: OrderCanceledEvent) => void): this;
  prependListener(event: "expired", listener: (e: OrderExpiredEvent) => void): this;
  prependListener(event: "ended", listener: (e: OrderEndedEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "created", listener: (e: OrderCreatedEvent) => void): this;
  prependOnceListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  prependOnceListener(event: "rejected", listener: (e: OrderRejectedEvent) => void): this;
  prependOnceListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  prependOnceListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  prependOnceListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  prependOnceListener(event: "canceled", listener: (e: OrderCanceledEvent) => void): this;
  prependOnceListener(event: "expired", listener: (e: OrderExpiredEvent) => void): this;
  prependOnceListener(event: "ended", listener: (e: OrderEndedEvent) => void): this;
}

export abstract class OrderStream<Props extends OrderProps> extends EventEmitter
  implements OrderActions {
  public readonly props: Props
  private cachedCreated?: OrderCreatedEvent;
  private cachedAccepted?: OrderAcceptedEvent;
  private cachedRejected?: OrderRejectedEvent;
  private cachedFilled?: OrderFilledEvent;
  private cachedProfitLoss?: OrderProfitLossEvent;
  private cachedClosed?: OrderClosedEvent;
  private cachedCanceled?: OrderCanceledEvent;
  private cachedExpired?: OrderExpiredEvent;
  private cachedEnded?: OrderEndedEvent;
  constructor(props: Props) {
    super();
    this.props = Object.freeze(props);
    this.on("created", e => this.cachedCreated = e)
    this.on("accepted", e => this.cachedAccepted = e)
    this.on("rejected", e => this.cachedRejected = e)
    this.on("filled", e => this.cachedFilled = e)
    this.on("profitLoss", e => this.cachedProfitLoss = e)
    this.on("closed", e => this.cachedClosed = e)
    this.on("canceled", e => this.cachedCanceled = e)
    this.on("expired", e => this.cachedExpired = e)
    this.on("ended", e => this.cachedEnded = e)
  }

  created(): Promise<OrderCreatedEvent> {
    if (this.cachedCreated) {
      return Promise.resolve(this.cachedCreated);
    } else {
      return new Promise(resolve => this.once("created", resolve));
    }
  }

  accepted(): Promise<OrderAcceptedEvent> {
    if (this.cachedAccepted) {
      return Promise.resolve(this.cachedAccepted);
    } else {
      return new Promise(resolve => this.once("accepted", resolve));
    }
  }

  rejected(): Promise<OrderRejectedEvent> {
    if (this.cachedRejected) {
      return Promise.resolve(this.cachedRejected);
    } else {
      return new Promise(resolve => this.once("rejected", resolve));
    }
  }

  filled(): Promise<OrderFilledEvent> {
    if (this.cachedFilled) {
      return Promise.resolve(this.cachedFilled);
    } else {
      return new Promise(resolve => this.once("filled", resolve));
    }
  }

  profitLoss(): Promise<OrderProfitLossEvent> {
    if (this.cachedProfitLoss) {
      return Promise.resolve(this.cachedProfitLoss);
    } else {
      return new Promise(resolve => this.once("profitLoss", resolve));
    }
  }

  closed(): Promise<OrderClosedEvent> {
    if (this.cachedClosed) {
      return Promise.resolve(this.cachedClosed);
    } else {
      return new Promise(resolve => this.once("closed", resolve));
    }
  }

  canceled(): Promise<OrderCanceledEvent> {
    if (this.cachedCanceled) {
      return Promise.resolve(this.cachedCanceled);
    } else {
      return new Promise(resolve => this.once("canceled", resolve));
    }
  }

  expired(): Promise<OrderExpiredEvent> {
    if (this.cachedExpired) {
      return Promise.resolve(this.cachedExpired);
    } else {
      return new Promise(resolve => this.once("expired", resolve));
    }
  }

  ended(): Promise<OrderEndedEvent> {
    if (this.cachedEnded) {
      return Promise.resolve(this.cachedEnded);
    } else {
      return new Promise(resolve => this.once("ended", resolve));
    }
  }

  abstract close(): OrderClosedEvent;
  abstract cancel(): OrderCanceledEvent;
  abstract end(): OrderEndedEvent;
}

export class DebugOrderStream<Props extends OrderProps> extends OrderStream<Props> {
  constructor(props: Props) {
    super(props);
    const log = debug("order").extend(props.id);

    const created = log.extend("created");
    this.prependListener("created", e => created("%j", e));

    const accepted = log.extend("accepted");
    this.prependListener("accepted", e => accepted("%j", e));

    const rejected = log.extend("rejected");
    this.prependListener("rejected", e => rejected("%j", e));

    const filled = log.extend("filled");
    this.prependListener("filled", e => filled("%j", e));

    const profitLoss = log.extend("profitLoss");
    this.prependListener("profitLoss", e => profitLoss("%j", e));

    const closed = log.extend("closed");
    this.prependListener("closed", e => closed("%j", e));

    const canceled = log.extend("canceled");
    this.prependListener("canceled", e => canceled("%j", e));

    const expired = log.extend("expired");
    this.prependListener("expired", e => expired("%j", e));

    const end = log.extend("ended");
    this.prependListener("ended", e => end("%j", e));
  }

  close(): OrderClosedEvent {
    throw new Error("not implemented");
  }
  cancel(): OrderCanceledEvent {
    throw new Error("not implemented");
  }
  end(): OrderEndedEvent {
    throw new Error("not implemented");
  }

  emitCreated(e: OrderCreatedEvent): void {
    setImmediate(() => this.emit("created", e));
  }

  emitAccepted(e: OrderAcceptedEvent): void {
    setImmediate(() => this.emit("accepted", e));
  }

  emitRejected(e: OrderRejectedEvent): void {
    setImmediate(() => this.emit("rejected", e));
  }

  emitFilled(e: OrderFilledEvent): void {
    setImmediate(() => this.emit("filled", e));
  }

  emitProfitLoss(e: OrderProfitLossEvent): void {
    setImmediate(() => this.emit("profitLoss", e));
  }

  emitClosed(e: OrderClosedEvent): void {
    setImmediate(() => this.emit("closed", e));
  }

  emitCanceled(e: OrderCanceledEvent): void {
    setImmediate(() => this.emit("canceled", e));
  }

  emitExpired(e: OrderExpiredEvent): void {
    setImmediate(() => this.emit("expired", e));
  }

  emitEnded(e: OrderEndedEvent): void {
    setImmediate(() => this.emit("ended", e));
  }
}
