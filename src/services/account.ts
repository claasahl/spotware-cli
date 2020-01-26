import { EventEmitter } from "events";
import debug from "debug";

export enum Events {
  BALANCE = "account:balance:changed",
  EQUITY = "account:equity:changed",
  MARGIN = "account:margin:changed",
  ACCOUNT = "account:computed"
}

/**
 * Event signaling that the account's balance has changed by the specified amount.
 */
export interface BalanceChangedEvent {
  type: Events.BALANCE;
  amount: number;
}
/**
 * Event signaling that the account's equity has changed by the specified amount.
 */
export interface EquityChangedEvent {
  type: Events.EQUITY;
  amount: number;
}
/**
 * Event signaling that the account's margin has changed by the specified amount.
 */
export interface MarginChangedEvent {
  type: Events.MARGIN;
  amount: number;
}
/**
 * Event containing a complete snapshot of an account.
 */
export interface SnapshotEvent {
  type: Events.ACCOUNT;
  balance: number;
  equity: number;
  margin: number;
}

export class Service {
  private readonly logger = debug("account");
  private readonly emitter: EventEmitter;
  private readonly snapshot: SnapshotEvent = {
    type: Events.ACCOUNT,
    balance: 0,
    equity: 0,
    margin: 0
  };

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    if (this.logger.enabled) {
      emitter.on(Events.BALANCE, e => this.logger("%j", e));
      emitter.on(Events.EQUITY, e => this.logger("%j", e));
      emitter.on(Events.MARGIN, e => this.logger("%j", e));
      emitter.on(Events.ACCOUNT, e => this.logger("%j", e));
    }
    emitter.on(Events.BALANCE, this._onBalanceChanged.bind(this));
    emitter.on(Events.EQUITY, this._onEquityChanged.bind(this));
    emitter.on(Events.MARGIN, this._onMarginChanged.bind(this));
  }

  /**
   * Change account's balance by specified amount
   * @param amount amount by which the account's balance is to be changed
   */
  public balanceChanged(amount: number): BalanceChangedEvent {
    const event: BalanceChangedEvent = {
      type: Events.BALANCE,
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
      type: Events.EQUITY,
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
      type: Events.MARGIN,
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
    this.emitter.on(Events.BALANCE, listener);
  }
  public offBalanceChanged(
    listener: (event: BalanceChangedEvent) => void
  ): void {
    this.emitter.off(Events.BALANCE, listener);
  }
  public onEquityChanged(listener: (event: EquityChangedEvent) => void): void {
    this.emitter.on(Events.EQUITY, listener);
  }
  public offEquityChanged(listener: (event: EquityChangedEvent) => void): void {
    this.emitter.off(Events.EQUITY, listener);
  }
  public onMarginChanged(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.on(Events.MARGIN, listener);
  }
  public offMarginChanged(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.off(Events.MARGIN, listener);
  }
  public onSnapshot(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.on(Events.ACCOUNT, listener);
  }
  public offShotshot(listener: (event: MarginChangedEvent) => void): void {
    this.emitter.off(Events.ACCOUNT, listener);
  }

  private _onBalanceChanged(event: BalanceChangedEvent) {
    this.snapshot.balance += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private _onEquityChanged(event: EquityChangedEvent) {
    this.snapshot.equity += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }

  private _onMarginChanged(event: MarginChangedEvent) {
    this.snapshot.margin += event.amount;
    this.emitter.emit(this.snapshot.type, { ...this.snapshot });
  }
}
