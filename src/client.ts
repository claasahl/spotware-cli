import SpotwareSubject from "./testSubject";

import config from "./config";
import { concat, merge } from "rxjs";
import { flatMap } from "rxjs/operators";

const { port, host, clientId, clientSecret, accessToken } = config;
const subject = new SpotwareSubject(
  { clientId, clientSecret, accessToken },
  { port, host }
);

concat(
  subject.authenticate(),
  subject.symbol("BTC/EUR"),
  merge(
    subject.accounts().pipe(
      flatMap(
        account => subject.spots(account.ctidTraderAccountId, "BTC/EUR") // simplify
      )
    ),
    subject.heartbeats()
  )
).subscribe();
