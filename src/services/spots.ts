import { EventEmitter } from "events";
import debug from "debug";

export interface AskPriceChangedEvent {
  type: "spots:ask:changed";
  price: number;
}
export interface BidPriceChangedEvent {
  type: "spots:bid:changed";
  price: number;
}
export interface SnapshotEvent {
  type: "spots:snapshot:computed";
  ask: number;
  bid: number;
}

export class Service {
  private readonly logger = debug("spots");
  private readonly emitter: EventEmitter;
  private readonly snapshot: Partial<SnapshotEvent> &
    Pick<SnapshotEvent, "type"> = {
    type: "spots:snapshot:computed"
  };
  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    emitter.on("spots:ask:changed", this._onAskPriceChanged.bind(this));
    emitter.on("spots:bid:changed", this._onBidPriceChanged.bind(this));
    emitter.on("spots:snapshot:computed", this._onSnapshotEvent.bind(this));
  }

  public askPriceChanged(price: number): AskPriceChangedEvent {
    const event: AskPriceChangedEvent = {
      type: "spots:ask:changed",
      price
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public bidPriceChanged(price: number): BidPriceChangedEvent {
    const event: BidPriceChangedEvent = {
      type: "spots:bid:changed",
      price
    };
    this.emitter.emit(event.type, event);
    return event;
  }
  public spotPriceChanged(ask: number, bid: number): SnapshotEvent {
    const event: SnapshotEvent = {
      type: "spots:snapshot:computed",
      ask,
      bid
    };
    this.emitter.emit(event.type, event);
    return event;
  }

  public onAskPriceChanged(
    listener: (event: AskPriceChangedEvent) => void
  ): void {
    this.emitter.on("spots:ask:changed", listener);
  }
  public offAskPriceChanged(
    listener: (event: AskPriceChangedEvent) => void
  ): void {
    this.emitter.off("spots:ask:changed", listener);
  }
  public onBidPriceChanged(
    listener: (event: BidPriceChangedEvent) => void
  ): void {
    this.emitter.on("spots:bid:changed", listener);
  }
  public offBidPriceChanged(
    listener: (event: BidPriceChangedEvent) => void
  ): void {
    this.emitter.off("spots:bid:changed", listener);
  }
  public onSnapshot(listener: (event: SnapshotEvent) => void): void {
    this.emitter.on("spots:snapshot:computed", listener);
  }
  public offSnapshot(listener: (event: SnapshotEvent) => void): void {
    this.emitter.off("spots:snapshot:computed", listener);
  }

  private _onAskPriceChanged(event: AskPriceChangedEvent) {
    this.logger("%j", event);
    this.snapshot.ask = event.price;
    if (this.snapshot.ask && this.snapshot.bid) {
      this.emitter.emit(this.snapshot.type, { ...this.snapshot });
    }
  }
  private _onBidPriceChanged(event: BidPriceChangedEvent) {
    this.logger("%j", event);
    this.snapshot.bid = event.price;
    if (this.snapshot.ask && this.snapshot.bid) {
      this.emitter.emit(this.snapshot.type, { ...this.snapshot });
    }
  }
  private _onSnapshotEvent(event: SnapshotEvent) {
    this.logger("%j", event);
  }
}
