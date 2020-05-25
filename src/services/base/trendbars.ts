import { Readable } from "stream";
import debug from "debug";
import ms from "ms";

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
const trendbarEventTypes: TrendbarEvent['type'][] = ["TRENDBAR"]

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

const streamConfig = { objectMode: true, emitClose: false, read: () => { } }

abstract class TrendbarsStreamBase extends Readable implements TrendbarsStream {
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

export class DebugTrendbarsStream extends TrendbarsStreamBase {
  tryTrendbar(e: Omit<TrendbarEvent, "type">): void {
    const event: TrendbarEvent = {...e, type: "TRENDBAR"};
    const {timestamp, type, ...rest} = event;
    this.push({timestamp, type, ...rest});
  }
}
