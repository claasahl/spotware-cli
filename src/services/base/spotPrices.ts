import { Readable } from "stream";
import debug from "debug";

import { Price, Timestamp, Symbol } from "./types";
import { TrendbarsStream, TrendbarsProps } from "./trendbars";

export interface AskPriceChangedEvent {
  type: "ASK_PRICE_CHANGED";
  ask: Price;
  timestamp: Timestamp;
}
export interface BidPriceChangedEvent {
  type: "BID_PRICE_CHANGED";
  bid: Price;
  timestamp: Timestamp;
}
export interface PriceChangedEvent {
  type: "PRICE_CHANGED";
  ask: Price;
  bid: Price;
  timestamp: Timestamp;
}
export type SpotPricesEvent = AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent;
const spotPricesEventTypes: SpotPricesEvent['type'][] = ["ASK_PRICE_CHANGED", "BID_PRICE_CHANGED", "PRICE_CHANGED"]

export type SpotPricesSimpleTrendbarsProps = Omit<TrendbarsProps, keyof SpotPricesProps>;
export interface SpotPricesProps {
  readonly symbol: Symbol;
}

export interface SpotPricesActions {
  trendbars(props: SpotPricesSimpleTrendbarsProps): Promise<TrendbarsStream>;
}

export declare interface SpotPricesStream extends Readable {
  ask(): Promise<AskPriceChangedEvent>;
  bid(): Promise<BidPriceChangedEvent>;
  price(): Promise<PriceChangedEvent>;

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

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

export abstract class SpotPricesStream extends Readable implements SpotPricesActions {
  public readonly props: SpotPricesProps;
  private readonly cachedEvents: Map<SpotPricesEvent["type"], SpotPricesEvent>;
  private readonly log: debug.Debugger;

  constructor(props: SpotPricesProps) {
    super(streamConfig);
    this.props = Object.freeze(props);
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
    this.log = debug("spotPrices").extend(props.symbol.toString());
  }

  push(event: SpotPricesEvent | null): boolean {
    if (event && spotPricesEventTypes.includes(event.type)) {
      this.cachedEvents.set(event.type, event);
      this.log("%j", event);
    }
    return super.push(event)
  }

  private cachedEvent<T extends SpotPricesEvent>(type: T["type"]): Promise<T> {
    if (!spotPricesEventTypes.includes(type)) {
      const error = new Error(`event type '${type}' is not allowed. Only ${spotPricesEventTypes.join(", ")} as allowed.`)
      return Promise.reject(error);
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return Promise.resolve(event as T);
    } else {
      return new Promise(resolve => {
        const isEvent = (event: SpotPricesEvent) => {
          if (event.type === type) {
            resolve(event as T);
            this.off("data", isEvent);
          }
        }
        this.on("data", isEvent);
        this.once("close", () => this.off("data", isEvent));
      });
    }
  }

  ask(): Promise<AskPriceChangedEvent> {
    return this.cachedEvent("ASK_PRICE_CHANGED");
  }

  bid(): Promise<BidPriceChangedEvent> {
    return this.cachedEvent("BID_PRICE_CHANGED");
  }

  price(): Promise<PriceChangedEvent> {
    return this.cachedEvent("PRICE_CHANGED");
  }

  abstract trendbars(props: SpotPricesSimpleTrendbarsProps): Promise<TrendbarsStream>;
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

  trendbars(_props: SpotPricesSimpleTrendbarsProps): Promise<TrendbarsStream> {
    throw new Error("not implemented");
  }

  tryAsk(e: Omit<AskPriceChangedEvent, "type">): void {
    this.push({ ...e, type: "ASK_PRICE_CHANGED" })
  }

  tryBid(e: Omit<BidPriceChangedEvent, "type">): void {
    this.push({ ...e, type: "BID_PRICE_CHANGED" })
  }

  tryPrice(e: Omit<PriceChangedEvent, "type">): void {
    this.push({ ...e, type: "PRICE_CHANGED" })
  }
}
