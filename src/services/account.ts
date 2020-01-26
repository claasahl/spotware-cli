import { EventEmitter } from "events";
import debug from "debug";

export interface BalanceChangedEvent {
  type: "account:balance:changed";
  amount: number;
}
export interface EquityChangedEvent {
  type: "account:equity:changed";
  amount: number;
}
export interface MarginChangedEvent {
  type: "account:margin:changed";
  amount: number;
}
export interface SnapshotEvent {
  type: "account:snapshot";
  balance: number;
  equity: number;
  margin: number;
}

export class Service {
  private readonly logger = debug("account");
  private readonly emitter: EventEmitter;
  private readonly snapshot: SnapshotEvent = {
    type: "account:snapshot",
    balance: 0,
    equity: 0,
    margin: 0
  };

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    emitter.on("account:balance:changed", this.onBalanceChanged.bind(this));
    emitter.on("account:equity:changed", this.onEquityChanged.bind(this));
    emitter.on("account:margin:changed", this.onMarginChanged.bind(this));
    emitter.on("account:snapshot", this.onSnapshot.bind(this));
  }
  public balanceChanged(amount: number): BalanceChangedEvent {
    const event: BalanceChangedEvent = {
      type: "account:balance:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public equityChanged(amount: number): EquityChangedEvent {
    const event: EquityChangedEvent = {
      type: "account:equity:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public marginChanged(amount: number): MarginChangedEvent {
    const event: MarginChangedEvent = {
      type: "account:margin:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  private onBalanceChanged(event: BalanceChangedEvent) {
    this.logger("%j", event);
    this.snapshot.balance += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private onEquityChanged(event: EquityChangedEvent) {
    this.logger("%j", event);
    this.snapshot.equity += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private onMarginChanged(event: MarginChangedEvent) {
    this.logger("%j", event);
    this.snapshot.margin += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private onSnapshot(event: SnapshotEvent) {
    this.logger("%j", event);
  }
}
