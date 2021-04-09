import { Trendbar } from "../../utils";

/**
 * Tests whether the bar is bullish
 * @param bar
 * @returns `true`, if the var is bullish
 */
function isBullish(bar: Trendbar): boolean {
  return bar.open < bar.close;
}

/**
 * Tests whether the bar is bearish
 * @param bar
 * @returns `true`, if the var is bearish
 */
function isBearish(bar: Trendbar): boolean {
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
function isTop(bar1: Trendbar, bar2: Trendbar, bar3: Trendbar): boolean {
  return (
    bar1.close <= bar2.close &&
    bar2.close >= bar3.close &&
    isBullish(bar2) &&
    isBearish(bar3)
  );
}

/**
 * Tests whether bars 1, 2 and 3 form a "\/"-pattern.
 *
 * @param bar1
 * @param bar2
 * @param bar3
 * @returns `true`, if `bar2` forms a bottom
 */
function isBottom(bar1: Trendbar, bar2: Trendbar, bar3: Trendbar): boolean {
  return (
    bar1.close >= bar2.close &&
    bar2.close <= bar3.close &&
    isBearish(bar2) &&
    isBullish(bar3)
  );
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
function isBetween(
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
