import { Messages, ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import assert from "assert";

import { bufferedTrendbars, Trendbar } from "./trendbar";

function increment(
  priceLevels: Map<number, number>,
  price: number,
  resolution: number
): void {
  const priceLevel = Math.floor(price / resolution);
  const count = priceLevels.get(priceLevel) || 0;
  priceLevels.set(priceLevel, count + 1);
}

function decrement(
  priceLevels: Map<number, number>,
  price: number,
  resolution: number
): void {
  const priceLevel = Math.floor(price / resolution);
  const count = priceLevels.get(priceLevel) || 0;
  assert.ok(count, `negative count for price level ${priceLevel}. why??????`);
  if (count === 1) {
    priceLevels.delete(priceLevel);
  } else {
    priceLevels.set(priceLevel, count - 1);
  }
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  periods: number;
  property?: (bar: Trendbar) => number;
  resolution: number;
}
export function recurringPriceLevels(options: Options) {
  const buffer = bufferedTrendbars(options);
  const priceLevels = new Map<number, number>();
  const inc = (price: number) =>
    increment(priceLevels, price, options.resolution);
  const dec = (price: number) =>
    decrement(priceLevels, price, options.resolution);
  return (msg: Messages) => {
    const { added, removed } = buffer(msg);
    for (const bar of added) {
      inc(bar.open);
      inc(bar.high);
      inc(bar.low);
      inc(bar.close);
    }
    for (const bar of removed) {
      dec(bar.open);
      dec(bar.high);
      dec(bar.low);
      dec(bar.close);
    }
    return priceLevels;
  };
}
