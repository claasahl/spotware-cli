import { Observable, combineLatest } from "rxjs";

import { Trendbar, SimpleMovingAverage } from "../../operators";
import { Recommendation } from "../../types";

function signal(
  smaH4: number,
  smaH1: number,
  smaM5: number,
  recentHigh: number,
  recentLow: number,
  live: number
): Recommendation {
  console.log(
    smaH4 < live,
    smaH1 < live,
    smaM5 < live,
    "||",
    smaH4 > live,
    smaH1 > live,
    smaM5 > live
  );
  if (smaH4 < live && smaH1 < live && smaM5 < live) {
    return recentHigh < live ? "STRONGER BUY" : "BUY";
  }
  if (smaH4 > live && smaH1 > live && smaM5 > live) {
    return recentLow > live ? "STRONGER SELL" : "SELL";
  }
  return "NEUTRAL";
}

export function signals(
  h4: Observable<Trendbar>,
  h1: Observable<Trendbar>,
  m5: Observable<Trendbar>,
  live: Observable<number>,
  period: number = 60
): Observable<Recommendation> {
  const smaH4 = h4.pipe(SimpleMovingAverage(period));
  const smaH1 = h1.pipe(SimpleMovingAverage(period));
  const smaM5 = m5.pipe(SimpleMovingAverage(period));
  return combineLatest(
    smaH4,
    smaH1,
    smaM5,
    live,
    (smaH4, smaH1, smaM5, live) => {
      return signal(
        smaH4.close,
        smaH1.close,
        smaM5.close,
        smaM5.high,
        smaM5.low,
        live
      );
    }
  );
}
