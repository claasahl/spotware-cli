export * from "./highLow";
export * from "./insideBarMomentum";
export * from "./period";
export * from "./sma";
export * from "./trendbar";
export * from "./volume";
export * from "./williams";

const FACTOR = Math.pow(10, 5);
export function price(price: number, digits: number): number {
  const TMP = Math.pow(10, digits);
  return Math.round((price / FACTOR) * TMP) / TMP;
}
