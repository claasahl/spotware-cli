import {
  Observable,
  EMPTY,
  concat,
  identity,
  OperatorFunction,
  pipe
} from "rxjs";
import debug from "debug";
import { TlsOptions } from "tls";

import { Spot, Trendbar, Trader, Order, Position } from "./types";
import TestSubject from "./testSubject";
import { map, mapTo, flatMap, publish, refCount } from "rxjs/operators";
import {
  ProtoOATrendbarPeriod,
  ProtoOATradeSide
} from "@claasahl/spotware-adapter";
import { toTrendbars, toSlidingTrendbars } from "./utils";

interface AuthenticationOptions {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
interface ConnectionOptions {
  port: number;
  host: string;
  options?: TlsOptions;
}

export class SpotwareOnline implements Trader {
  private log = debug("spotware-online");
  private subject: TestSubject;
  private symbol: string;
  private slidingTrendbars: boolean;
  private auth: Observable<never>;

  constructor({
    auth,
    conn,
    symbol,
    slidingTrendbars = false
  }: {
    auth: AuthenticationOptions;
    conn: ConnectionOptions;
    symbol: string;
    slidingTrendbars?: boolean;
  }) {
    this.log("options: %j", { auth, conn, symbol });
    this.subject = new TestSubject(auth, conn);
    this.symbol = symbol;
    this.slidingTrendbars = slidingTrendbars;
    this.auth = this.subject
      .authenticate()
      .pipe(mapTo(EMPTY), flatMap(identity), publish(), refCount());
    this.subject.heartbeats().subscribe();
  }

  spots(): Observable<Spot> {
    const liveSpots = this.subject
      .spots(this.symbol)
      .pipe(map(spot => ({ ...spot, timestamp: spot.date.getTime() })));
    return concat(this.auth, liveSpots);
  }

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]> {
    const toBars: OperatorFunction<Spot, Trendbar[]> = this.slidingTrendbars
      ? toSlidingTrendbars(period)
      : pipe(
          toTrendbars(period),
          map(trendbar => [trendbar])
        );
    return concat(this.auth, this.spots().pipe(toBars));
  }

  positions(): Observable<Position> {
    throw new Error("Method not implemented.");
  }

  stopOrder({
    price,
    volume,
    tradeSide,
    expirationTimestamp,
    stopLoss,
    takeProfit,
    trailingStopLoss
  }: Order): Observable<Position> {
    return concat(
      this.auth,
      this.subject.stopOrder(this.symbol, {
        stopPrice: price,
        volume,
        tradeSide: (() => {
          switch (tradeSide) {
            case "BUY":
              return ProtoOATradeSide.BUY;
            case "SELL":
              return ProtoOATradeSide.SELL;
          }
        })(),
        expirationTimestamp,
        stopLoss,
        takeProfit,
        trailingStopLoss
      })
    ).pipe(flatMap(() => EMPTY));
  }
  limitOrder({
    price,
    volume,
    tradeSide,
    expirationTimestamp,
    stopLoss,
    takeProfit,
    trailingStopLoss
  }: Order): Observable<Position> {
    return concat(
      this.auth,
      this.subject.limitOrder(this.symbol, {
        limitPrice: price,
        volume,
        tradeSide: (() => {
          switch (tradeSide) {
            case "BUY":
              return ProtoOATradeSide.BUY;
            case "SELL":
              return ProtoOATradeSide.SELL;
          }
        })(),
        expirationTimestamp,
        stopLoss,
        takeProfit,
        trailingStopLoss
      })
    ).pipe(flatMap(() => EMPTY));
  }
}
