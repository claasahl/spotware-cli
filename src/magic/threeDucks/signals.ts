import { SimpleMovingAverage } from "../../indicators";
import { Recommendation, Recommender } from "../../types";

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

export function signals(period: number = 60): Recommender<"h4" | "h1" | "m5"> {
  const smaH4 = SimpleMovingAverage(period);
  const smaH1 = SimpleMovingAverage(period);
  const smaM5 = SimpleMovingAverage(period);
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
