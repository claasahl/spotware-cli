import { Transform, TransformCallback, pipeline } from "stream";
import debug from "debug";
import ms from "ms";

import { Price, Volume, Period, Timestamp, Symbol, GenericReadable } from "./types";
import { BidPriceChangedEvent, SpotPricesEvent, SpotPricesStream } from "./spotPrices"

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

interface Bucket {
  begin: Timestamp;
  end: Timestamp;
}
function bucket(timestamp: Timestamp, period: Period): Bucket {
  const millisPerBucket = period;
  const bucketNo = Math.floor(timestamp / millisPerBucket);
  const begin = bucketNo * millisPerBucket;
  const end = begin + millisPerBucket;
  return { begin, end };
}

function accumulateTrendbar(
  prev: TrendbarEvent,
  curr: BidPriceChangedEvent,
  index: number
): TrendbarEvent {
  const next = { ...prev };
  if (index === 0) {
      next.open = curr.bid;
  }
  if (prev.high < curr.bid) {
      next.high = curr.bid;
  }
  if (prev.low > curr.bid) {
      next.low = curr.bid;
  }
  next.close = curr.bid;
  return next;
}

function toTrendbar(
  timestamp: Timestamp,
  events: BidPriceChangedEvent[]
): TrendbarEvent {
  const seed: TrendbarEvent = {
      type: "TRENDBAR",
      open: 0,
      high: Number.MIN_VALUE,
      low: Number.MAX_VALUE,
      close: 0,
      timestamp,
      volume: 0
  };
  return events.reduce(accumulateTrendbar, seed);
}

export class ToTrendbars extends Transform implements TrendbarsStream {
  readonly props: TrendbarsProps;
  private readonly values: Array<BidPriceChangedEvent> = [];
  private readonly log: debug.Debugger;

  constructor(props: TrendbarsProps) {
      super({ objectMode: true });
      this.props = Object.freeze(props);
      this.log = debug("trendbars")
        .extend(ms(props.period))
        .extend(props.symbol.toString());
  }

  push(event: TrendbarEvent | null): boolean {
    if (event && trendbarEventTypes.includes(event.type)) {
      this.log("%j", event);
    }
    return super.push(event)
  }

  _transform(chunk: SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
      if (chunk.type === "BID_PRICE_CHANGED") {
          this.values.push(chunk);
          const bucket1 = this.bucket(this.values[0]);
          const bucket2 = this.bucket(this.values[this.values.length - 1]);
          if (bucket1.begin !== bucket2.begin) {
              const eventsInBucket = this.values.filter(
                  e => this.bucket(e).begin === bucket1.begin
              );
              this.values.splice(0, eventsInBucket.length);
              this.push(toTrendbar(bucket1.begin, eventsInBucket))
          }
          return callback();
      } else if (chunk.type === "ASK_PRICE_CHANGED") {
          if (this.values.length === 0) {
              return callback();
          }
          const bucket1 = this.bucket(this.values[0]);
          const bucket2 = this.bucket(chunk);
          if (bucket1.begin !== bucket2.begin) {
              const eventsInBucket = this.values.filter(
                  e => this.bucket(e).begin === bucket1.begin
              );
              this.values.splice(0, eventsInBucket.length);
              this.push(toTrendbar(bucket1.begin, eventsInBucket))
          }
          return callback();
      }
  }

  bucket(e: SpotPricesEvent): Bucket {
      const { timestamp } = e;
      const { period } = this.props
      return bucket(timestamp, period)
  }
}

export async function toTrendbars(props: TrendbarsProps & { spots: SpotPricesStream }): Promise<TrendbarsStream> {
  const { spots, ...originalProps } = props;
  return pipeline(
      spots,
      new ToTrendbars(originalProps),
      err => console.log("pipeline callback", err)
  )
}