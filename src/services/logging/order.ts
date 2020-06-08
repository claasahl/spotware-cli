import debug from "debug";

import * as B from "../base";

const events: B.OrderEvent["type"][] = ["CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export function logOrderEvents<Props extends B.OrderProps>(stream: B.OrderStream<Props>): void {
  const log = debug("order")
    .extend(stream.props.symbol.toString())
    .extend(stream.props.id);
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
