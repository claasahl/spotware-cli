import { simpleMovingAverage } from "indicators";
import { Recommendation, Recommender } from "../../types";

function signal(
  smaH4: number | undefined,
  smaH1: number | undefined,
  smaM5: number | undefined,
  recentHigh: number | undefined,
  recentLow: number | undefined,
  live: number
): Recommendation {
  const date = new Date();
  console.log(
    date,
    "DUCKLINGS",
    JSON.stringify({
      smaH4,
      smaH1,
      smaM5,
      recentHigh,
      recentLow,
      live
    })
  );
  if (!smaH4 || !smaH1 || !smaM5 || !recentHigh || !recentLow) {
    return "NEUTRAL";
  }
  if (smaH4 < live && smaH1 < live && smaM5 < live && recentHigh < live) {
    return "BUY";
  }
  if (smaH4 > live && smaH1 > live && smaM5 > live && recentLow > live) {
    return "SELL";
  }
  return "NEUTRAL";
}

export function signals(period: number = 60): Recommender {
  const smaH4 = simpleMovingAverage(period);
  const smaH1 = simpleMovingAverage(period);
  const smaM5 = simpleMovingAverage(period);
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
      if (h4) {
        context.h4Close = smaH4(h4.close);
      }
      if (h1) {
        context.h1Close = smaH1(h1.close);
      }
      if (m5) {
        context.m5Close = smaM5(m5.close);
        context.m5High = m5.high;
        context.m5Low = m5.low;
      }
    },
    recommend: price => {
      const { h4Close, h1Close, m5Close, m5High, m5Low } = context;
      return signal(h4Close, h1Close, m5Close, m5High, m5Low, price);
    }
  };
}
