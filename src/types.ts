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

export interface Order {
  tradeSide: "BUY" | "SELL";
  price: number;
  volume: number;
  expirationTimestamp?: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStopLoss?: boolean;
}

export interface Position extends Order {
  id: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";
}

export interface Trader {
  spots(): Observable<Spot>;
  trendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar>;
  slidingTrendbars(period: ProtoOATrendbarPeriod): Observable<Trendbar[]>;
  positions(): Observable<Position>;
  stopOrder(order: Order): Observable<Position>;
  limitOrder(order: Order): Observable<Position>;
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
