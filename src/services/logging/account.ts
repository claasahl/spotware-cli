import debug from "debug";
import {finished} from "stream"

import * as T from "../types";

const events: T.AccountEvent["type"][] = ["BALANCE_CHANGED" , "TRANSACTION" , "EQUITY_CHANGED" , "CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export function logAccountEvents(stream: T.AccountStream): void {
  const log = debug("account");
  stream.prependListener("data", e => {
    if (e && events.includes(e.type)) {
      log("%j", e);
    }
  })
  finished(stream, err => err ? log(err) : log("ENDED"))
}
