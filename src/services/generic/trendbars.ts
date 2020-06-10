import { Transform, TransformCallback, pipeline } from "stream";

import * as B from "../base";
import * as L from "../logging";

interface Bucket {
  begin: B.Timestamp;
  end: B.Timestamp;
}
function bucket(timestamp: B.Timestamp, period: B.Period): Bucket {
  const millisPerBucket = period;
  const bucketNo = Math.floor(timestamp / millisPerBucket);
  const begin = bucketNo * millisPerBucket;
  const end = begin + millisPerBucket;
  return { begin, end };
}

function accumulateTrendbar(
  prev: B.TrendbarEvent,
  curr: B.BidPriceChangedEvent,
  index: number
): B.TrendbarEvent {
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
  timestamp: B.Timestamp,
  events: B.BidPriceChangedEvent[]
): B.TrendbarEvent {
  const seed: B.TrendbarEvent = {
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

export class ToTrendbars extends Transform implements B.TrendbarsStream {
  readonly props: B.TrendbarsProps;
  private readonly values: Array<B.BidPriceChangedEvent> = [];

  constructor(props: B.TrendbarsProps) {
      super({ objectMode: true });
      this.props = Object.freeze(props);
      L.logTrendbarEvents(this);
  }

  push(event: B.TrendbarEvent | null): boolean {
    return super.push(event)
  }

  _transform(chunk: B.SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
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

  bucket(e: B.SpotPricesEvent): Bucket {
      const { timestamp } = e;
      const { period } = this.props
      return bucket(timestamp, period)
  }
}

export function toTrendbars(props: B.TrendbarsProps & { spots: B.SpotPricesStream }): B.TrendbarsStream {
  const { spots, ...originalProps } = props;
  return pipeline(
      spots,
      new ToTrendbars(originalProps),
      err => console.log("pipeline callback", err)
  )
}