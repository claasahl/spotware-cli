import { EventEmitter } from "events";
import debug from "debug";

/**
 * Event signaling that the account's balance has changed by the specified amount.
 */
export interface BalanceChangedEvent {
  type: "account:balance:changed";
  amount: number;
}
/**
 * Event signaling that the account's equity has changed by the specified amount.
 */
export interface EquityChangedEvent {
  type: "account:equity:changed";
  amount: number;
}
/**
 * Event signaling that the account's margin has changed by the specified amount.
 */
export interface MarginChangedEvent {
  type: "account:margin:changed";
  amount: number;
}
/**
 * Event containing a complete snapshot of an account.
 */
export interface SnapshotEvent {
  type: "account:snapshot:computed";
  balance: number;
  equity: number;
  margin: number;
}

export class Service {
  private readonly logger = debug("account");
  private readonly emitter: EventEmitter;
  private readonly snapshot: SnapshotEvent = {
    type: "account:snapshot:computed",
    balance: 0,
    equity: 0,
    margin: 0
  };

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    emitter.on("account:balance:changed", this._onBalanceChanged.bind(this));
    emitter.on("account:equity:changed", this._onEquityChanged.bind(this));
    emitter.on("account:margin:changed", this._onMarginChanged.bind(this));
    emitter.on("account:snapshot:computed", this._onSnapshot.bind(this));
  }

  /**
   * Change account's balance by specified amount
   * @param amount amount by which the account's balance is to be changed
   */
  public balanceChanged(amount: number): BalanceChangedEvent {
    const event: BalanceChangedEvent = {
      type: "account:balance:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  /**
   * Change account's equity by specified amount
   * @param amount amount by which the account's equity is to be changed
   */
  public equityChanged(amount: number): EquityChangedEvent {
    const event: EquityChangedEvent = {
      type: "account:equity:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  /**
   * Change account's margin by specified amount
   * @param amount amount by which the account's margin is to be changed
   */
  public marginChanged(amount: number): MarginChangedEvent {
    const event: MarginChangedEvent = {
      type: "account:margin:changed",
      amount
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  /**
   * Registers _listener_ and
   * @param listener the listener to be registered
   */
  public onBalanceChanged(
    listener: (event: BalanceChangedEvent) => void
  ): void {
    this.emitter.on("account:balance:changed", listener);
  }
  public offBalanceChanged(
    listener: (event: BalanceChangedEvent) => void
  ): void {
    this.emitter.off("account:balance:changed", listener);
  }
  public onEquityChanged(listener: (event: EquityChangedEvent) => void): void {
    this.emitter.on("account:equity:changed", listener);
  }
  public offEquityChanged(listener: (event: EquityChangedEvent) => void): void {
    this.emitter.off("account:equity:changed", listener);
  }
  public onMarginChanged(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.on("account:margin:change", listener);
  }
  public offMarginChanged(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.off("account:margin:change", listener);
  }
  public onSnapshot(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.on("account:snapshot:computed", listener);
  }
  public offShotshot(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.off("account:snapshot:computed", listener);
  }

  private _onBalanceChanged(event: BalanceChangedEvent) {
    this.logger("%j", event);
    this.snapshot.balance += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private _onEquityChanged(event: EquityChangedEvent) {
    this.logger("%j", event);
    this.snapshot.equity += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private _onMarginChanged(event: MarginChangedEvent) {
    this.logger("%j", event);
    this.snapshot.margin += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private _onSnapshot(event: SnapshotEvent) {
    this.logger("%j", event);
  }
}
