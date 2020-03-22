import { EventEmitter } from "events";
import debug from "debug";

import { Price, Timestamp, Symbol } from "./types";
import { TrendbarsStream, TrendbarsProps } from "./trendbars";

export interface AskPriceChangedEvent {
  ask: Price;
  timestamp: Timestamp;
}
export interface BidPriceChangedEvent {
  bid: Price;
  timestamp: Timestamp;
}
export interface PriceChangedEvent {
  ask: Price;
  bid: Price;
  timestamp: Timestamp;
}

export type SpotPricesSimpleTrendbarsProps = Omit<TrendbarsProps, keyof SpotPricesProps>;
export interface SpotPricesProps {
  readonly symbol: Symbol;
}

export interface SpotPricesActions {
  trendbars(props: SpotPricesSimpleTrendbarsProps): TrendbarsStream;
}

export declare interface SpotPricesStream extends EventEmitter {
  ask(cb: (e: AskPriceChangedEvent) => void): void;
  bid(cb: (e: BidPriceChangedEvent) => void): void;

  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
  addListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
  addListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
  on(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
  on(event: "price", listener: (e: PriceChangedEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
  once(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
  once(event: "price", listener: (e: PriceChangedEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
  prependListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
  prependListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
  prependListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
  prependOnceListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
  prependOnceListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
  prependOnceListener(event: "price", listener: (e: PriceChangedEvent) => void): this;
}

export abstract class SpotPricesStream extends EventEmitter implements SpotPricesActions {
  public readonly props: SpotPricesProps;
  private cachedAskPrice?: AskPriceChangedEvent;
  private cachedBidPrice?: BidPriceChangedEvent;
  constructor(props: SpotPricesProps) {
    super();
    this.props = Object.freeze(props);
    this.on("ask", e => this.cachedAskPrice = e)
    this.on("bid", e => this.cachedBidPrice = e)
  }
  ask(cb: (e: AskPriceChangedEvent) => void): void {
    setImmediate(() => {
      if (this.cachedAskPrice) {
        cb(this.cachedAskPrice)
      } else {
        this.once("ask", cb)
      }
    })
  }
  bid(cb: (e: BidPriceChangedEvent) => void): void {
    setImmediate(() => {
      if (this.cachedBidPrice) {
        cb(this.cachedBidPrice)
      } else {
        this.once("bid", cb)
      }
    })
  }
  abstract trendbars(props: SpotPricesSimpleTrendbarsProps): TrendbarsStream;
}

export class DebugSpotPricesStream extends SpotPricesStream {
  constructor(props: SpotPricesProps) {
    super(props);
    const log = debug("spotPrices");

    const ask = log.extend("ask");
    this.prependListener("ask", e => ask("%j", e));

    const bid = log.extend("bid");
    this.prependListener("bid", e => bid("%j", e));

    const price = log.extend("price");
    this.prependListener("price", e => price("%j", e));
  }

  trendbars(_props: SpotPricesSimpleTrendbarsProps): TrendbarsStream {
    throw new Error("not implemented");
  }

  emitAsk(e: AskPriceChangedEvent): void {
    setImmediate(() => this.emit("ask", e));
  }

  emitBid(e: BidPriceChangedEvent): void {
    setImmediate(() => this.emit("bid", e));
  }

  emitPrice(e: PriceChangedEvent): void {
    setImmediate(() => this.emit("price", e));
  }
}
