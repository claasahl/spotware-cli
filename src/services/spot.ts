import { EventEmitter } from "events";
import debug from "debug";
import { Spot } from "../types";

export enum Events {
  ASK = "spot:ask:changed",
  BID = "spot:bid:changed",
  SPOT = "spot:computed"
}
export interface AskPriceChangedEvent {
  type: Events.ASK;
  price: number;
  timestamp: number;
}
export interface BidPriceChangedEvent {
  type: Events.BID;
  price: number;
  timestamp: number;
}
export interface SpotPriceChangedEvent extends Spot {
  type: Events.SPOT;
}

class Service {
  private readonly logger = debug("spot");
  private readonly emitter: EventEmitter;
  private readonly spot: Pick<Spot, "ask" | "bid" | "timestamp">;
  constructor(
    emitter: EventEmitter,
    seed?: Pick<Spot, "ask" | "bid" | "timestamp">
  ) {
    this.emitter = emitter;
    this.spot = { ask: 0, bid: 0, timestamp: 0, ...seed };
    if (this.logger.enabled) {
      emitter.on(Events.ASK, e => this.logger("%j", e));
      emitter.on(Events.BID, e => this.logger("%j", e));
      emitter.on(Events.SPOT, e => this.logger("%j", e));
    }
    emitter.on(Events.ASK, this.onAskPriceChanged.bind(this));
    emitter.on(Events.BID, this.onBidPriceChanged.bind(this));
  }

  protected emit(
    event: AskPriceChangedEvent | BidPriceChangedEvent | SpotPriceChangedEvent
  ): void {
    this.emitter.emit(event.type, event);
  }

  public on(
    event: Events.ASK,
    listener: (e: AskPriceChangedEvent) => void
  ): void;
  public on(
    event: Events.BID,
    listener: (e: BidPriceChangedEvent) => void
  ): void;
  public on(
    event: Events.SPOT,
    listener: (e: SpotPriceChangedEvent) => void
  ): void;
  public on(event: Events, listener: (e: any) => void): void {
    this.emitter.on(event, listener);
  }
  public off(
    event: Events.ASK,
    listener: (e: AskPriceChangedEvent) => void
  ): void;
  public off(
    event: Events.BID,
    listener: (e: BidPriceChangedEvent) => void
  ): void;
  public off(
    event: Events.SPOT,
    listener: (e: SpotPriceChangedEvent) => void
  ): void;
  public off(event: Events, listener: (e: any) => void): void {
    this.emitter.off(event, listener);
  }

  private onAskPriceChanged(event: AskPriceChangedEvent) {
    this.spot.ask = event.price;
    this.spot.timestamp = event.timestamp;
    this.validateAndEmit();
  }
  private onBidPriceChanged(event: BidPriceChangedEvent) {
    this.spot.bid = event.price;
    this.spot.timestamp = event.timestamp;
    this.validateAndEmit();
  }
  private validateAndEmit() {
    const { ask, bid, timestamp } = this.spot;
    if (ask && bid && timestamp) {
      const event: SpotPriceChangedEvent = {
        type: Events.SPOT,
        ask,
        bid,
        spread: ask - bid,
        timestamp,
        date: new Date(timestamp)
      };
      this.emitter.emit(event.type, event);
    }
  }
}

export class Debug extends Service {
  public askPriceChanged(price: number, timestamp: number = Date.now()) {
    const event: AskPriceChangedEvent = {
      type: Events.ASK,
      price,
      timestamp
    };
    this.emit(event);
  }
  public bidPriceChanged(price: number, timestamp: number = Date.now()) {
    const event: BidPriceChangedEvent = {
      type: Events.BID,
      price,
      timestamp
    };
    this.emit(event);
  }
}
