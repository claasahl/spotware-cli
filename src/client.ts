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
  subject
    .accounts()
    .pipe(
      flatMap(account => subject.symbol(account.ctidTraderAccountId, "BTC/EUR"))
    ),
  merge(
    subject
      .accounts()
      .pipe(
        flatMap(account =>
          subject.spots(account.ctidTraderAccountId, "BTC/EUR")
        )
      ),
    subject.heartbeats()
  )
).subscribe();
