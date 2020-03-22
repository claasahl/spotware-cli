import { EventEmitter } from "events";
import debug from "debug";

import { Price, Volume, Period, Timestamp, Symbol } from "./types";

export interface TrendbarEvent {
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

export declare interface TrendbarsStream extends EventEmitter {
  trendbar(cb: (e: TrendbarEvent) => void): void;

  addListener(event: string, listener: (...args: any[]) => void): this;
  addListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

  once(event: string, listener: (...args: any[]) => void): this;
  once(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

  prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

  prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;
}

export class TrendbarsStream extends EventEmitter implements TrendbarsActions {
  public readonly props: TrendbarsProps;
  private cachedTrendbar?: TrendbarEvent;
  constructor(props: TrendbarsProps) {
    super();
    this.props = Object.freeze(props);
    this.on("trendbar", e => this.cachedTrendbar = e)
  }

  trendbar(cb: (e: TrendbarEvent) => void): void {
    setImmediate(() => {
      if(this.cachedTrendbar) {
        cb(this.cachedTrendbar);
      } else {
        this.once("trendbar", cb);
      }
    })
  }
}

export class DebugTrendbarsStream extends TrendbarsStream {
  constructor(props: TrendbarsProps) {
    super(props);
    const log = debug("trendbars");

    const trendbar = log.extend("trendbar");
    this.prependListener("trendbar", e => trendbar("%j", e));
  }

  emitTrendbar(e: TrendbarEvent): void {
    setImmediate(() => this.emit("trendbar", e));
  }
}
