import debug from "debug";

import * as T from "../types";

const events: T.OrderEvent["type"][] = ["CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export function logOrderEvents<Props extends T.OrderProps>(stream: T.OrderStream<Props>): void {
  const log = debug("order")
    .extend(stream.props.symbol.toString())
    .extend(stream.props.id);
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
