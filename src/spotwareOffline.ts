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

import { Trader, Spot, Trendbar, Order, Position } from "./types";
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

  spots(): Observable<Spot> {
    return defer(() => {
      const data = fs.readFileSync(this.file).toString("utf8");
      return rxFrom(JSON.parse(data) as any[]).pipe(
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
    });
  }

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]> {
    const toBars: OperatorFunction<Spot, Trendbar[]> = this.slidingTrendbars
      ? toSlidingTrendbars(period)
      : pipe(
          toTrendbars(period),
          map(trendbar => [trendbar])
        );
    return this.spots().pipe(toBars);
  }

  positions(): Observable<Position> {
    throw new Error("Method not implemented.");
  }

  stopOrder(_order: Order): Observable<Position> {
    throw new Error("Method not implemented.");
  }
  limitOrder(_order: Order): Observable<Position> {
    throw new Error("Method not implemented.");
  }
}
