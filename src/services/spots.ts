import { EventEmitter } from "events";
import debug from "debug";

export enum Events {
  ASK = "spots:ask:changed",
  BID = "spots:bid:changed",
  SPOT = "spots:snapshot:computed"
}
export interface AskPriceChangedEvent {
  type: Events.ASK;
  price: number;
}
export interface BidPriceChangedEvent {
  type: Events.BID;
  price: number;
}
export interface SnapshotEvent {
  type: Events.SPOT;
  ask: number;
  bid: number;
}

export class Service {
  private readonly logger = debug("spots");
  private readonly emitter: EventEmitter;
  private readonly snapshot: Partial<SnapshotEvent> &
    Pick<SnapshotEvent, "type"> = {
    type: Events.SPOT
  };
  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    if (this.logger.enabled) {
      emitter.on(Events.ASK, e => this.logger("%j", e));
      emitter.on(Events.BID, e => this.logger("%j", e));
      emitter.on(Events.SPOT, e => this.logger("%j", e));
    }
    emitter.on(Events.ASK, this._onAskPriceChanged.bind(this));
    emitter.on(Events.BID, this._onBidPriceChanged.bind(this));
  }

  public askPriceChanged(price: number): AskPriceChangedEvent {
    const event: AskPriceChangedEvent = {
      type: Events.ASK,
      price
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public bidPriceChanged(price: number): BidPriceChangedEvent {
    const event: BidPriceChangedEvent = {
      type: Events.BID,
      price
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public spotPriceChanged(ask: number, bid: number): SnapshotEvent {
    const event: SnapshotEvent = {
      type: Events.SPOT,
      ask,
      bid
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  public onAskPriceChanged(
    listener: (event: AskPriceChangedEvent) => void
  ): void {
    this.emitter.on(Events.ASK, listener);
  }
  public offAskPriceChanged(
    listener: (event: AskPriceChangedEvent) => void
  ): void {
    this.emitter.off(Events.ASK, listener);
  }
  public onBidPriceChanged(
    listener: (event: BidPriceChangedEvent) => void
  ): void {
    this.emitter.on(Events.BID, listener);
  }
  public offBidPriceChanged(
    listener: (event: BidPriceChangedEvent) => void
  ): void {
    this.emitter.off(Events.BID, listener);
  }
  public onSnapshot(listener: (event: SnapshotEvent) => void): void {
    this.emitter.on(Events.SPOT, listener);
  }
  public offSnapshot(listener: (event: SnapshotEvent) => void): void {
    this.emitter.off(Events.SPOT, listener);
  }

  private _onAskPriceChanged(event: AskPriceChangedEvent) {
    this.snapshot.ask = event.price;
    if (this.snapshot.ask && this.snapshot.bid) {
      this.emitter.emit(this.snapshot.type, { ...this.snapshot });
    }
  }
  private _onBidPriceChanged(event: BidPriceChangedEvent) {
    this.snapshot.bid = event.price;
    if (this.snapshot.ask && this.snapshot.bid) {
      this.emitter.emit(this.snapshot.type, { ...this.snapshot });
    }
  }
}
