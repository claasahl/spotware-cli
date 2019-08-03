import { Observable, combineLatest } from "rxjs";

import { Trendbar, SimpleMovingAverage } from "../../operators";

export type Recommendation =
  | "BUY"
  | "SELL"
  | "STRONGER BUY"
  | "STRONGER SELL"
  | "NEUTRAL";

function base(
  h4: Trendbar,
  h1: Trendbar,
  m5: Trendbar,
  live: number
): Recommendation {
  console.log(
    h4.close < live,
    h1.close < live,
    m5.close < live,
    "||",
    h4.close > live,
    h1.close > live,
    m5.close > live
  );
  if (h4.close < live && h1.close < live && m5.close < live) {
    return m5.high < live ? "STRONGER BUY" : "BUY";
  }
  if (h4.close > live && h1.close > live && m5.close > live) {
    return m5.low > live ? "STRONGER SELL" : "SELL";
  }
  return "NEUTRAL";
}

export function strategy(
  h4: Observable<Trendbar>,
  h1: Observable<Trendbar>,
  m5: Observable<Trendbar>,
  live: Observable<number>,
  period: number
): Observable<Recommendation> {
  const smaH4 = h4.pipe(SimpleMovingAverage(period));
  const smaH1 = h1.pipe(SimpleMovingAverage(period));
  const smaM5 = m5.pipe(SimpleMovingAverage(period));
  return combineLatest(smaH4, smaH1, smaM5, live, base);
}
