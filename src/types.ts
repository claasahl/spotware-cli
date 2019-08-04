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
