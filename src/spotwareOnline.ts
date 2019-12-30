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

import { Spot, Trendbar, Trader } from "./types";
import TestSubject from "./testSubject";
import {
  map,
  mapTo,
  flatMap,
  publish,
  refCount,
  scan,
  pairwise,
  filter
} from "rxjs/operators";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { periodToMillis } from "./utils";

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

  private liveTrendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar> {
    return this.spots().pipe(spotsToTrendbars(period));
  }

  private historicTrendbars(
    period: ProtoOATrendbarPeriod,
    from: Date | number,
    to: Date | number
  ): Observable<Trendbar> {
    return this.spots(from, to).pipe(spotsToTrendbars(period));
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

function spotsToTrendbars(
  period: ProtoOATrendbarPeriod
): OperatorFunction<Spot, Trendbar> {
  return pipe(
    map(spot => ({ ...spot, periodStart: periodStart(spot.date, period) })),
    scan(
      (acc, curr) => {
        const price = curr.bid;
        if (acc.date.getTime() === curr.periodStart.getTime()) {
          const trendbar = { ...acc };
          trendbar.close = price;
          if (trendbar.high < price) {
            trendbar.high = price;
          }
          if (trendbar.low > price) {
            trendbar.low = price;
          }
          return trendbar;
        } else {
          return {
            date: curr.periodStart,
            timestamp: curr.periodStart.getTime(),
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0,
            period
          };
        }
      },
      {
        date: new Date(0),
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        period
      }
    ),
    pairwise(),
    filter(([left, right]) => left.timestamp !== right.timestamp),
    map(([left, _right]) => left)
  );
}

function periodStart(date: Date, period: ProtoOATrendbarPeriod): Date {
  const timestamp = date.getTime();
  const millis = periodToMillis(period);
  const periodStart = Math.floor(timestamp / millis) * millis;
  return new Date(periodStart);
}
