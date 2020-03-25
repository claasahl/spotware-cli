import { EventEmitter } from "events";
import debug from "debug";

import { Symbol, Timestamp, TradeSide, Volume, Price, OrderType } from "./types";

export interface OrderAcceptedEvent {
  timestamp: Timestamp;
}
export interface OrderFilledEvent {
  timestamp: Timestamp;
  entry: Price;
}
export interface OrderProfitLossEvent {
  timestamp: Timestamp;
  profitLoss: Price;
}
export interface OrderClosedEvent {
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
}
export interface OrderEndEvent {
  timestamp: Timestamp;
  exit?: Price;
  profitLoss?: Price;
}

interface CommonOrderProps {
  readonly id: string;
  readonly symbol: Symbol;
  readonly tradeSide: TradeSide;
  readonly volume: Volume;
  readonly takeProfit?: Price;
  readonly stopLoss?: Price;
  readonly orderType: OrderType
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
  close(): this;
  cancel(): this;
  end(): this;
  amend(): this;
}

export declare interface OrderStream<Props extends OrderProps> extends EventEmitter {
  filled(cb: (e: OrderFilledEvent) => void): void;
  profitLoss(cb: (e: OrderProfitLossEvent) => void): void

  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  addListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  addListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  addListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  addListener(event: "end", listener: (e: OrderEndEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  on(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  on(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  on(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  on(event: "end", listener: (e: OrderEndEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  once(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  once(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  once(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  once(event: "end", listener: (e: OrderEndEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  prependListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  prependListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  prependListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  prependListener(event: "end", listener: (e: OrderEndEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
  prependOnceListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
  prependOnceListener(event: "profitLoss", listener: (e: OrderProfitLossEvent) => void): this;
  prependOnceListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
  prependOnceListener(event: "end", listener: (e: OrderEndEvent) => void): this;
}

export abstract class OrderStream<Props extends OrderProps> extends EventEmitter
  implements OrderActions {
  public readonly props: Props
  private cachedEntry?: OrderFilledEvent;
  private cachedProfitLoss?: OrderProfitLossEvent;
  constructor(props: Props) {
    super();
    this.props = Object.freeze(props);
    this.on("filled", e => this.cachedEntry = e)
    this.on("profitLoss", e => this.cachedProfitLoss = e)
  }

  filled(cb: (e: OrderFilledEvent) => void): void {
    setImmediate(() => {
      if (this.cachedEntry) {
        cb(this.cachedEntry);
      } else {
        this.once("filled", cb)
      }
    })
  }

  profitLoss(cb: (e: OrderProfitLossEvent) => void): void {
    setImmediate(() => {
      if (this.cachedProfitLoss) {
        cb(this.cachedProfitLoss);
      } else {
        this.once("profitLoss", cb)
      }
    })
  }

  abstract close(): this;
  abstract cancel(): this;
  abstract end(): this;
  abstract amend(): this;
}

export class DebugOrderStream<Props extends OrderProps> extends OrderStream<Props> {
  constructor(props: Props) {
    super(props);
    const log = debug("order");

    const accepted = log.extend("accepted");
    this.prependListener("accepted", e => accepted("%j", e));

    const filled = log.extend("filled");
    this.prependListener("filled", e => filled("%j", e));

    const profitLoss = log.extend("profitLoss");
    this.prependListener("profitLoss", e => profitLoss("%j", e));

    const closed = log.extend("closed");
    this.prependListener("closed", e => closed("%j", e));

    const end = log.extend("end");
    this.prependListener("end", e => end("%j", e));
  }

  close(): this {
    throw new Error("not implemented");
  }
  cancel(): this {
    throw new Error("not implemented");
  }
  end(): this {
    throw new Error("not implemented");
  }
  amend(): this {
    throw new Error("not implemented");
  }

  emitAccepted(e: OrderAcceptedEvent): void {
    setImmediate(() => this.emit("accepted", e));
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

  emitEnd(e: OrderEndEvent): void {
    setImmediate(() => this.emit("end", e));
  }
}
