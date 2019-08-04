import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
export type Recommendation =
  | "BUY"
  | "SELL"
  | "STRONGER BUY"
  | "STRONGER SELL"
  | "NEUTRAL";

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

export interface Snapshot {
  d1: Trendbar;
  h12: Trendbar;
  h4: Trendbar;
  h1: Trendbar;
  m30: Trendbar;
  m20: Trendbar;
  m15: Trendbar;
  m10: Trendbar;
  m5: Trendbar;
  m4: Trendbar;
  m3: Trendbar;
  m2: Trendbar;
  m1: Trendbar;
}
export interface Recommender {
  update(snapshot: Snapshot): void;
  recommend(price: number): Recommendation;
}
