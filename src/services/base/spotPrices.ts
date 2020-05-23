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
  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (event: SpotPricesEvent) => void): this;
  addListener(event: "end", listener: () => void): this;
  addListener(event: "readable", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  emit(event: "close"): boolean;
  emit(event: "data", chunk: any): boolean;
  emit(event: "end"): boolean;
  emit(event: "readable"): boolean;
  emit(event: "error", err: Error): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (event: SpotPricesEvent) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (event: SpotPricesEvent) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (event: SpotPricesEvent) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (event: SpotPricesEvent) => void): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (event: SpotPricesEvent) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

export abstract class SpotPricesStream extends Readable implements SpotPricesActions {
  public readonly props: SpotPricesProps;
  private readonly cachedEvents: Map<SpotPricesEvent["type"], SpotPricesEvent>;
  private readonly log: debug.Debugger;

  constructor(props: SpotPricesProps) {
    super(streamConfig);
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

  private cachedEventOrNull<T extends SpotPricesEvent>(type: T["type"]): T | null {
    if (!spotPricesEventTypes.includes(type)) {
      throw new Error(`event type '${type}' is not allowed. Only ${spotPricesEventTypes.join(", ")} as allowed.`)
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return event as T;
    }
    return null;
  }

  askOrNull(): AskPriceChangedEvent | null {
    return this.cachedEventOrNull("ASK_PRICE_CHANGED");
  }

  bidOrNull(): BidPriceChangedEvent | null {
    return this.cachedEventOrNull("BID_PRICE_CHANGED");
  }

  priceOrNull(): PriceChangedEvent | null {
    return this.cachedEventOrNull("PRICE_CHANGED");
  }

  abstract trendbars(props: SpotPricesSimpleTrendbarsProps): Promise<TrendbarsStream>;
}

export class DebugSpotPricesStream extends SpotPricesStream {
  async trendbars(_props: SpotPricesSimpleTrendbarsProps): Promise<TrendbarsStream> {
    throw new Error("not implemented");
  }

  tryAsk(e: Omit<AskPriceChangedEvent, "type">): void {
    const event: AskPriceChangedEvent = {...e, type: "ASK_PRICE_CHANGED"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }

  tryBid(e: Omit<BidPriceChangedEvent, "type">): void {
    const event: BidPriceChangedEvent = {...e, type: "BID_PRICE_CHANGED"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }

  tryPrice(e: Omit<PriceChangedEvent, "type">): void {
    const event: PriceChangedEvent = {...e, type: "PRICE_CHANGED"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }
}
