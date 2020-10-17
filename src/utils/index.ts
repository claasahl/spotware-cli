export * from "./period";
export * from "./sma";
export * from "./trendbar";

const FACTOR = Math.pow(10, 5);
export function price(price: number): number {
  return price / FACTOR;
}
