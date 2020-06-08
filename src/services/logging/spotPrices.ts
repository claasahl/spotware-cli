import debug from "debug";

import * as B from "../base";

const events: B.SpotPricesEvent["type"][] = ["ASK_PRICE_CHANGED" , "BID_PRICE_CHANGED" , "PRICE_CHANGED"]

export function logSpotPriceEvents(stream: B.SpotPricesStream): void {
  const log = debug("spotPrices")
    .extend(stream.props.symbol.toString());
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
