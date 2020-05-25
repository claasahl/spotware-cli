import { Readable } from "stream";
import debug from "debug";

import { Price, Timestamp, Symbol, GenericReadable } from "./types";
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

export interface SpotPricesStream extends GenericReadable<SpotPricesEvent>, SpotPricesActions {
  readonly props: SpotPricesProps;
  askOrNull(): AskPriceChangedEvent | null; // TODO remove or add to all streams
  bidOrNull(): BidPriceChangedEvent | null; // TODO remove or add to all streams
  priceOrNull(): PriceChangedEvent | null; // TODO remove or add to all streams
}

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

abstract class SpotPricesStreamBase extends Readable implements SpotPricesStream {
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

export class DebugSpotPricesStream extends SpotPricesStreamBase {
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
