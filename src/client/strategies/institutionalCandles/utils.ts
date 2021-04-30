import { Trendbar } from "../../../utils";

/**
 * Tests whether the bar is bullish
 * @param bar
 * @returns `true`, if the var is bullish
 */
export function isBullish(bar: Trendbar): boolean {
  return bar.open < bar.close;
}

/**
 * Tests whether the bar is bearish
 * @param bar
 * @returns `true`, if the var is bearish
 */
export function isBearish(bar: Trendbar): boolean {
  return bar.open > bar.close;
}

/**
 * Tests whether bars 1, 2 and 3 form a "/\"-pattern.
 *
 * @param bar1
 * @param bar2
 * @param bar3
 * @returns `true`, if `bar2` forms a top
 */
export function isTop(bar1: Trendbar, bar2: Trendbar, bar3: Trendbar): boolean {
  return bar1.close <= bar2.close && bar2.close >= bar3.close;
}

/**
 * Tests whether bars 1, 2 and 3 form a "\/"-pattern.
 *
 * @param bar1
 * @param bar2
 * @param bar3
 * @returns `true`, if `bar2` forms a bottom
 */
export function isBottom(
  bar1: Trendbar,
  bar2: Trendbar,
  bar3: Trendbar
): boolean {
  return bar1.close >= bar2.close && bar2.close <= bar3.close;
}

/**
 * Tests whether `value` is situated between the referenced thresholds.
 *
 * @param value
 * @param threshold1
 * @param threshold2
 * @param inclusive whether the `value` may also overlap with the thresholds
 * @returns `true`, if `value` is between the two thresholds
 */
export function isBetween(
  value: number,
  threshold1: number,
  threshold2: number,
  inclusive = true
): boolean {
  const upper = Math.max(threshold1, threshold2);
  const lower = Math.min(threshold1, threshold2);
  if (inclusive) {
    return lower <= value && value <= upper;
  }
  return lower < value && value < upper;
}

export function isTopIC(bars: Trendbar[]): boolean {
  const prev = bars[bars.length - 5];
  const bar = bars[bars.length - 4];
  const next1 = bars[bars.length - 3];
  const next2 = bars[bars.length - 2];
  const next3 = bars[bars.length - 1];

  const isTopBar = isTop(prev, bar, next1) && prev.close > next1.close;
  const bullishThrust = isBullish(bar);
  const bearishTail = isBearish(next1) && isBearish(next2) && isBearish(next3);
  return isTopBar && bullishThrust && bearishTail;
}

export function isBottomIC(bars: Trendbar[]): boolean {
  const prev = bars[bars.length - 5];
  const bar = bars[bars.length - 4];
  const next1 = bars[bars.length - 3];
  const next2 = bars[bars.length - 2];
  const next3 = bars[bars.length - 1];

  const isBottomBar = isBottom(prev, bar, next1) && prev.close < next1.close;
  const bearishThrust = isBearish(bar);
  const bullishTail = isBullish(next1) && isBullish(next2) && isBullish(next3);
  return isBottomBar && bearishThrust && bullishTail;
}