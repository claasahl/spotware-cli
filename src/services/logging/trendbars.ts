import debug from "debug";
import ms from "ms";

import * as B from "../base";

const events: B.TrendbarEvent["type"][] = ["TRENDBAR"]

export function logTrendbarEvents(stream: B.TrendbarsStream): void {
  const log = debug("trendbars")
    .extend(stream.props.symbol.toString())
    .extend(ms(stream.props.period));
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
