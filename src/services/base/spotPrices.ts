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
  trendbars(props: SpotPricesSimpleTrendbarsProps): TrendbarsStream;
}

export interface SpotPricesStream extends GenericReadable<SpotPricesEvent>, SpotPricesActions {
  readonly props: SpotPricesProps;
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

  abstract trendbars(props: SpotPricesSimpleTrendbarsProps): TrendbarsStream;
}

export class DebugSpotPricesStream extends SpotPricesStreamBase {
  trendbars(_props: SpotPricesSimpleTrendbarsProps): TrendbarsStream {
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
