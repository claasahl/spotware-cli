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
