import { Observable, combineLatest } from "rxjs";

import { SimpleMovingAverage } from "../../operators";
import { SimpleMovingAverage as SimpleMoving } from "../../indicators";
import { Recommendation, Trendbar, Recommender } from "../../types";

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

export function signa1(period: number = 60): Recommender {
  const smaH4 = SimpleMoving(period);
  const smaH1 = SimpleMoving(period);
  const smaM5 = SimpleMoving(period);
  const context: {
    h4Close?: number;
    h1Close?: number;
    m5Close?: number;
    m5High?: number;
    m5Low?: number;
  } = {};
  return {
    update: snapshot => {
      const { h4, h1, m5 } = snapshot;
      context.h4Close = smaH4(h4.close);
      context.h1Close = smaH1(h1.close);
      context.m5Close = smaM5(m5.close);
      context.m5High = smaH4(m5.high);
      context.m5Low = smaH4(m5.low);
    },
    recommend: price => {
      const { h4Close, h1Close, m5Close, m5High, m5Low } = context;
      if (!h4Close || !h1Close || !m5Close || !m5High || !m5Low) {
        return "NEUTRAL";
      }
      return signal(h4Close, h1Close, m5Close, m5High, m5Low, price);
    }
  };
}
