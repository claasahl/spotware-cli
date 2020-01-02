import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { Observable, defer, from as rxFrom } from "rxjs";
import { map, filter } from "rxjs/operators";
import fs from "fs";

import { Trader, Spot, Trendbar, Order, Position } from "./types";
import { toSlidingTrendbars, toTrendbars } from "./utils";

export class SpotwareOffline implements Trader {
  private readonly file: fs.PathLike;

  constructor({ file }: { file: fs.PathLike }) {
    this.file = file;
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

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar> {
    return this.spots().pipe(toTrendbars(period));
  }

  slidingTrendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]> {
    return this.spots().pipe(toSlidingTrendbars(period));
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
