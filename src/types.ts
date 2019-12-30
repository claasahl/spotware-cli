import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { Observable } from "rxjs";
export type Recommendation = "BUY" | "SELL" | "NEUTRAL";

export interface Trendbar {
  volume: number;
  period: ProtoOATrendbarPeriod;
  low: number;
  open: number;
  close: number;
  high: number;
  timestamp: number;
  date: Date;
}

export interface Spot {
  ask: number;
  bid: number;
  spread: number;
  timestamp: number;
  date: Date;
}

export interface Trader {
  spots(): Observable<Spot>;
  spots(from: Date | number, to: Date | number): Observable<Spot>;
  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar>;
  trendbars(
    period: ProtoOATrendbarPeriod,
    from: Date | number,
    to: Date | number
  ): Observable<Trendbar>;
  positions(): Observable<any>;
  positions(from: Date | number, to: Date | number): Observable<any>;
  stopOrder(): Observable<void>;
  limitOrder(): Observable<void>;
}

export interface Snapshot {
  date: Date;
  timestamp: number;
  d1?: Trendbar;
  h12?: Trendbar;
  h4?: Trendbar;
  h1?: Trendbar;
  m30?: Trendbar;
  m20?: Trendbar;
  m15?: Trendbar;
  m10?: Trendbar;
  m5?: Trendbar;
  m4?: Trendbar;
  m3?: Trendbar;
  m2?: Trendbar;
  m1?: Trendbar;
}
export interface Recommender {
  update(snapshot: Snapshot): void;
  recommend(price: number): Recommendation;
}
