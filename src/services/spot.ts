import debug from "debug";
import { Spot } from "../types";
import { Observable, OperatorFunction, pipe, combineLatest } from "rxjs";
import { tap, map, filter, pairwise, share } from "rxjs/operators";

export enum SpotEvents {
  ASK = "spot:ask:changed",
  BID = "spot:bid:changed",
  SPOT = "spot:computed"
}
export interface AskPriceChangedEvent {
  type: SpotEvents.ASK;
  price: number;
  timestamp: number;
}
export interface BidPriceChangedEvent {
  type: SpotEvents.BID;
  price: number;
  timestamp: number;
}
export interface SpotPriceChangedEvent extends Spot {
  type: SpotEvents.SPOT;
}

function log<T>(logger: debug.Debugger): OperatorFunction<T, T> {
  return pipe(
    tap({
      complete: () => logger("completed"),
      error: err => logger("%j", err),
      next: (e: T) => logger("%j", e)
    })
  );
}

function increasingTimestamps(): OperatorFunction<
  AskPriceChangedEvent | BidPriceChangedEvent,
  AskPriceChangedEvent | BidPriceChangedEvent
> {
  return pipe(
    pairwise(),
    filter(([prev, curr]) => prev.timestamp <= curr.timestamp),
    map(([_prev, curr]) => curr)
  );
}

function combineAskBidPrices(
  askChanged: AskPriceChangedEvent,
  bidChanged: BidPriceChangedEvent
): SpotPriceChangedEvent {
  const { price: ask } = askChanged;
  const { price: bid } = bidChanged;
  const spread = ask - bid;
  const timestamp = Math.max(askChanged.timestamp, bidChanged.timestamp);
  const date = new Date(timestamp);
  return { type: SpotEvents.SPOT, ask, bid, spread, timestamp, date };
}

export function service(
  events: Observable<AskPriceChangedEvent | BidPriceChangedEvent>
): Observable<SpotPriceChangedEvent> {
  const logger = debug("spots");
  const inputs = logger.extend("inputs");
  const outputs = logger.extend("outputs");

  const a = events.pipe(log(inputs), increasingTimestamps(), share());

  const askChangeEvents: Observable<AskPriceChangedEvent> = a.pipe(
    filter((e): e is AskPriceChangedEvent => e.type === SpotEvents.ASK)
  );
  const bidChangeEvents: Observable<BidPriceChangedEvent> = a.pipe(
    filter((e): e is BidPriceChangedEvent => e.type === SpotEvents.BID)
  );

  return combineLatest(
    askChangeEvents,
    bidChangeEvents,
    combineAskBidPrices
  ).pipe(log(outputs));
}
