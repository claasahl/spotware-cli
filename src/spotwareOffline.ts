import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import {
  Observable,
  OperatorFunction,
  pipe,
  defer,
  from as rxFrom
} from "rxjs";
import { map, filter } from "rxjs/operators";
import fs from "fs";
import util from "util";

import { Trader, Spot, Trendbar } from "./types";
import { toSlidingTrendbars, toTrendbars } from "./utils";

export class SpotwareOffline implements Trader {
  private readonly file: fs.PathLike;
  private readonly slidingTrendbars: boolean;

  constructor({
    file,
    slidingTrendbars = false
  }: {
    file: fs.PathLike;
    slidingTrendbars?: boolean;
  }) {
    this.file = file;
    this.slidingTrendbars = slidingTrendbars;
  }

  spots(): Observable<Spot>;
  spots(from: number | Date, to: number | Date): Observable<Spot>;
  spots(from?: number | Date, to?: number | Date): Observable<Spot> {
    return defer(() => {
      const data = fs.readFileSync(this.file).toString("utf8");
      const spots = rxFrom(JSON.parse(data) as any[]).pipe(
        filter(
          (spot): spot is { ask: number; bid: number; timestamp: number } =>
            typeof spot.ask === "number" &&
            typeof spot.bid === "number" &&
            typeof spot.timestamp === "number"
        ),
        map(spot => ({
          ...spot,
          spread: spot.ask - spot.bid,
          date: new Date(spot.timestamp)
        }))
      );
      if (typeof from === "undefined" || typeof to === "undefined") {
        return spots;
      }
      const fromTimestamp = util.isDate(from) ? from.getTime() : from;
      const toTimestamp = util.isDate(to) ? to.getTime() : to;
      return spots.pipe(
        filter(
          spot =>
            fromTimestamp <= spot.timestamp && spot.timestamp < toTimestamp
        )
      );
    });
  }

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]>;
  trendbars(
    period: ProtoOATrendbarPeriod,
    from: number | Date,
    to: number | Date
  ): Observable<Trendbar[]>;
  trendbars(
    period: ProtoOATrendbarPeriod,
    from?: number | Date,
    to?: number | Date
  ): Observable<Trendbar[]> {
    const toBars: OperatorFunction<Spot, Trendbar[]> = this.slidingTrendbars
      ? toSlidingTrendbars(period)
      : pipe(
          toTrendbars(period),
          map(trendbar => [trendbar])
        );
    if (typeof from === "undefined" || typeof to === "undefined") {
      return this.spots().pipe(toBars);
    }
    const fromDate = typeof from === "number" ? new Date(from) : from;
    const toDate = typeof to === "number" ? new Date(to) : to;
    return this.spots(fromDate, toDate).pipe(toBars);
  }

  positions(): Observable<any>;
  positions(from: number | Date, to: number | Date): Observable<any>;
  positions(_from?: number | Date, _to?: number | Date): Observable<any> {
    throw new Error("Method not implemented.");
  }

  stopOrder(): Observable<void> {
    throw new Error("Method not implemented.");
  }
  limitOrder(): Observable<void> {
    throw new Error("Method not implemented.");
  }
}
