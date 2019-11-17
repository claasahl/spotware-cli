import { SpotwareSubject } from "./spotwareSubject";
import ms from "ms";

import config from "./config";
import { applicationAuth, accountAuth, dealList } from "./requests";
import { concat } from "rxjs";
import { map } from "rxjs/operators";

const {
  port,
  host,
  clientId,
  clientSecret,
  accessToken,
  ctidTraderAccountId
} = config;
const subject = new SpotwareSubject(port, host);

subject
  .pipe(
    map(pm => ({ date: new Date(), pm })),
    map(msg => JSON.stringify(msg, null, 2))
  )
  .subscribe(console.log);

const fromTimestamp = new Date("2019-11-11T00:00:00.0Z").getTime();
const toTimestamp = fromTimestamp + ms("1w");
concat(
  applicationAuth(subject, { clientId, clientSecret }),
  accountAuth(subject, { accessToken, ctidTraderAccountId }),
  dealList(subject, { ctidTraderAccountId, fromTimestamp, toTimestamp })
).subscribe();
