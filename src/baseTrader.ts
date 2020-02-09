import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { Observable } from "rxjs";

import { Trader, Trendbar, Spot, Position, Order } from "./types";
import { toTrendbars, toSlidingTrendbars } from "./utils";

export abstract class BaseTrader implements Trader {
  abstract spots(): Observable<Spot>;

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar> {
    return this.spots().pipe(toTrendbars(period));
  }

  slidingTrendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]> {
    return this.spots().pipe(toSlidingTrendbars(period));
  }

  abstract orders(): Observable<Order>;

  abstract positions(): Observable<Position>;

  abstract stopOrder(order: Omit<Order, "id">): Observable<Order>;

  abstract limitOrder(order: Omit<Order, "id">): Observable<Order>;
}