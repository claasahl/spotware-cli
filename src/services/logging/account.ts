import debug from "debug";

import * as B from "../base";

const events: B.AccountEvent["type"][] = ["BALANCE_CHANGED" , "TRANSACTION" , "EQUITY_CHANGED" , "CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export function logAccountEvents(stream: B.AccountStream): void {
  const log = debug("account");
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
}
