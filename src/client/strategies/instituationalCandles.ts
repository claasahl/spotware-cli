import { Trendbar } from "../../utils";

/**
 * Tests whether bars 1, 2 and 3 form a "/\"-pattern.
 *
 * @param bar1
 * @param bar2
 * @param bar3
 * @returns `true`, if `bar2` forms a top
 */
function isTop(bar1: Trendbar, bar2: Trendbar, bar3: Trendbar): boolean {
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
function isBottom(bar1: Trendbar, bar2: Trendbar, bar3: Trendbar): boolean {
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
