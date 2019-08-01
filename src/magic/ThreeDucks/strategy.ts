import { Trendbar } from "../../operators";

export function strategy(
  h4: Trendbar,
  h1: Trendbar,
  m5: Trendbar,
  [live, ctidTraderAccountId]: number[]
): [string, number] | undefined {
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
    return [m5.high < live ? "STRONGER BUY" : "BUY", ctidTraderAccountId];
  }
  if (h4.close > live && h1.close > live && m5.close > live) {
    return [m5.low > live ? "STRONGER SELL" : "SELL", ctidTraderAccountId];
  }
  return undefined;
}
