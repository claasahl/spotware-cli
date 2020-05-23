import { Readable } from "stream";
import debug from "debug";
import ms from "ms";

import { Price, Volume, Period, Timestamp, Symbol } from "./types";

export interface TrendbarEvent {
  type: "TRENDBAR";
  open: Price;
  high: Price;
  low: Price;
  close: Price;
  volume: Volume;
  timestamp: Timestamp;
}
const trendbarEventTypes: TrendbarEvent['type'][] = ["TRENDBAR"]

export interface TrendbarsProps {
  readonly symbol: Symbol;
  readonly period: Period;
}

export interface TrendbarsActions {
  // no actions, yet
}

export declare interface TrendbarsStream extends Readable {
  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (event: TrendbarEvent) => void): this;
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
  on(event: "data", listener: (event: TrendbarEvent) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (event: TrendbarEvent) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (event: TrendbarEvent) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (event: TrendbarEvent) => void): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (event: TrendbarEvent) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

export class TrendbarsStream extends Readable implements TrendbarsActions {
  public readonly props: TrendbarsProps;
  private readonly cachedEvents: Map<TrendbarEvent["type"], TrendbarEvent>;
  private readonly log: debug.Debugger;

  constructor(props: TrendbarsProps) {
    super(streamConfig);
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
    this.log = debug("trendbars")
      .extend(ms(props.period))
      .extend(props.symbol.toString());
  }

  push(event: TrendbarEvent | null): boolean {
    if (event && trendbarEventTypes.includes(event.type)) {
      this.cachedEvents.set(event.type, event);
      this.log("%j", event);
    }
    return super.push(event)
  }

  private cachedEvent<T extends TrendbarEvent>(type: T["type"]): Promise<T> {
    if (!trendbarEventTypes.includes(type)) {
      const error = new Error(`event type '${type}' is not allowed. Only ${trendbarEventTypes.join(", ")} as allowed.`)
      return Promise.reject(error);
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return Promise.resolve(event as T);
    } else {
      return new Promise(resolve => {
        const isEvent = (event: TrendbarEvent) => {
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

  trendbar(): Promise<TrendbarEvent> {
    return this.cachedEvent("TRENDBAR");
  }

  private cachedEventOrNull<T extends TrendbarEvent>(type: T["type"]): T | null {
    if (!trendbarEventTypes.includes(type)) {
      throw new Error(`event type '${type}' is not allowed. Only ${trendbarEventTypes.join(", ")} as allowed.`)
    }
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return event as T;
    }
    return null;
  }

  trendbarOrNull(): TrendbarEvent | null {
    return this.cachedEventOrNull("TRENDBAR");
  }
}

export class DebugTrendbarsStream extends TrendbarsStream {
  tryTrendbar(e: Omit<TrendbarEvent, "type">): void {
    const event: TrendbarEvent = {...e, type: "TRENDBAR"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }
}
