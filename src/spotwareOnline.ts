import { Observable, EMPTY, concat, identity } from "rxjs";
import debug from "debug";
import { TlsOptions } from "tls";

import { Spot, Trendbar, Trader } from "./types";
import TestSubject from "./testSubject";
import { map, mapTo, flatMap, publish, refCount } from "rxjs/operators";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

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
  private auth: Observable<never>;

  constructor({
    auth,
    conn,
    symbol
  }: {
    auth: AuthenticationOptions;
    conn: ConnectionOptions;
    symbol: string;
  }) {
    this.log("options: %j", { auth, conn, symbol });
    this.subject = new TestSubject(auth, conn);
    this.symbol = symbol;
    this.auth = this.subject
      .authenticate()
      .pipe(mapTo(EMPTY), flatMap(identity), publish(), refCount());
  }

  spots(): Observable<Spot>;
  spots(from: Date | number, to: Date | number): Observable<Spot>;
  spots(from?: Date | number, to?: Date | number): Observable<Spot> {
    if (typeof from === "undefined" || typeof to === "undefined") {
      return concat(this.auth, this.liveSpots());
    }
    const fromDate = typeof from === "number" ? new Date(from) : from;
    const toDate = typeof to === "number" ? new Date(to) : to;
    return concat(this.auth, this.historicSpots(fromDate, toDate));
  }

  private liveSpots(): Observable<Spot> {
    return this.subject
      .spots(this.symbol)
      .pipe(map(spot => ({ ...spot, timestamp: spot.date.getTime() })));
  }

  private historicSpots(from: Date, to: Date): Observable<Spot> {
    return this.subject
      .tickData(this.symbol, from, to)
      .pipe(map(spot => ({ ...spot, timestamp: spot.date.getTime() })));
  }

  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar>;
  trendbars(
    period: ProtoOATrendbarPeriod,
    from: Date | number,
    to: Date | number
  ): Observable<Trendbar>;
  trendbars(
    period: ProtoOATrendbarPeriod,
    from?: Date | number,
    to?: Date | number
  ): Observable<Trendbar> {
    if (typeof from === "undefined" || typeof to === "undefined") {
      return concat(this.auth, this.liveTrendbars(period));
    }
    const fromDate = typeof from === "number" ? new Date(from) : from;
    const toDate = typeof to === "number" ? new Date(to) : to;
    return concat(this.auth, this.historicTrendbars(period, fromDate, toDate));
  }

  private liveTrendbars(_period: ProtoOATrendbarPeriod): Observable<Trendbar> {
    return EMPTY;
  }

  private historicTrendbars(
    _period: ProtoOATrendbarPeriod,
    _from: Date | number,
    _to: Date | number
  ): Observable<Trendbar> {
    return EMPTY;
  }

  positions(): Observable<any>;
  positions(from: number | Date, to: number | Date): Observable<any>;
  positions(_from?: any, _to?: any): Observable<any> {
    throw new Error("Method not implemented.");
  }
  stopOrder(): Observable<void> {
    throw new Error("Method not implemented.");
  }
  limitOrder(): Observable<void> {
    throw new Error("Method not implemented.");
  }
}
