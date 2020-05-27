import { Price, Volume, Period, Timestamp, Symbol, GenericReadable } from "./types";

export interface TrendbarEvent {
  type: "TRENDBAR";
  open: Price;
  high: Price;
  low: Price;
  close: Price;
  volume: Volume;
  timestamp: Timestamp;
}

export interface TrendbarsProps {
  readonly symbol: Symbol;
  readonly period: Period;
}

export interface TrendbarsActions {
  // no actions, yet
}

export interface TrendbarsStream extends GenericReadable<TrendbarEvent>, TrendbarsActions {
  readonly props: TrendbarsProps;
}

