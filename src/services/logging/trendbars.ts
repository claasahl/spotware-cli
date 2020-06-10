import debug from "debug";
import ms from "ms";

import * as T from "../types";

const events: T.TrendbarEvent["type"][] = ["TRENDBAR"]

export function logTrendbarEvents(stream: T.TrendbarsStream): void {
  const log = debug("trendbars")
    .extend(stream.props.symbol.toString())
    .extend(ms(stream.props.period));
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
