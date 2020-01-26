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
export interface SnapshotEvent extends Account {
  type: Events.ACCOUNT;
}

export interface Account {
  balance: number;
  equity: number;
  margin: number;
}

export class Service {
  private readonly logger = debug("account");
  private readonly emitter: EventEmitter;
  private readonly account: Account;

  constructor(emitter: EventEmitter, seed?: Account) {
    this.emitter = emitter;
    this.account = { balance: 0, equity: 0, margin: 0, ...seed };
    if (this.logger.enabled) {
      this.on(Events.BALANCE, e => this.logger("%j", e));
      this.on(Events.EQUITY, e => this.logger("%j", e));
      this.on(Events.MARGIN, e => this.logger("%j", e));
      this.on(Events.ACCOUNT, e => this.logger("%j", e));
    }
    this.on(Events.BALANCE, this.onBalanceChanged.bind(this));
    this.on(Events.EQUITY, this.onEquityChanged.bind(this));
    this.on(Events.MARGIN, this.onMarginChanged.bind(this));
  }

  protected emit(
    event:
      | BalanceChangedEvent
      | EquityChangedEvent
      | MarginChangedEvent
      | SnapshotEvent
  ): void {
    this.emitter.emit(event.type, event);
  }

  public on(
    event: Events.BALANCE,
    listener: (e: BalanceChangedEvent) => void
  ): void;
  public on(
    event: Events.EQUITY,
    listener: (e: EquityChangedEvent) => void
  ): void;
  public on(
    event: Events.MARGIN,
    listener: (e: MarginChangedEvent) => void
  ): void;
  public on(event: Events.ACCOUNT, listener: (e: SnapshotEvent) => void): void;
  public on(event: Events, listener: (e: any) => void): void {
    this.emitter.on(event, listener);
  }
  public off(
    event: Events.BALANCE,
    listener: (e: BalanceChangedEvent) => void
  ): void;
  public off(
    event: Events.EQUITY,
    listener: (e: EquityChangedEvent) => void
  ): void;
  public off(
    event: Events.MARGIN,
    listener: (e: MarginChangedEvent) => void
  ): void;
  public off(event: Events.ACCOUNT, listener: (e: SnapshotEvent) => void): void;
  public off(event: Events, listener: (e: any) => void): void {
    this.emitter.off(event, listener);
  }

  private onBalanceChanged(event: BalanceChangedEvent) {
    this.account.balance += event.amount;
    this.validateAndEmit();
  }

  private onEquityChanged(event: EquityChangedEvent) {
    this.account.equity += event.amount;
    this.validateAndEmit();
  }

  private onMarginChanged(event: MarginChangedEvent) {
    this.account.margin += event.amount;
    this.validateAndEmit();
  }
  private validateAndEmit() {
    const event: SnapshotEvent = {
      type: Events.ACCOUNT,
      ...this.account
    };
    this.emitter.emit(event.type, event);
  }
}
