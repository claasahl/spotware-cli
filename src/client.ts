import SpotwareSubject from "./testSubject";

import config from "./config";
import { concat, merge } from "rxjs";

const { port, host, clientId, clientSecret, accessToken } = config;
const subject = new SpotwareSubject(
  { clientId, clientSecret, accessToken },
  { port, host }
);

concat(
  subject.authenticate(),
  subject.symbol("BTC/USD"),
  subject.symbol("BTC/EUR"),
  merge(
    subject.spots("BTC/EUR"),
    subject.heartbeats(),
    subject.ordersAndPositions()
  )
).subscribe();
