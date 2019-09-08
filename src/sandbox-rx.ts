import { concat } from "rxjs";
import { map } from "rxjs/operators";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth,
  cancelOrder
} from "./requests";

// https://youtu.be/8CNVYWiR5fg?t=378

const subject = new SpotwareSubject(config.port, config.host);
subject
  .pipe(
    map(pm => {
      const date = new Date();
      return { timestamp: date.getTime(), date, msg: pm };
    })
  )
  .subscribe(
    next => console.log(JSON.stringify(next)),
    error => console.log("error", error),
    () => console.log("complete")
  );
const appAuth = applicationAuth(subject, {
  clientId: config.clientId,
  clientSecret: config.clientSecret
});
const accounts = getAccountsByAccessToken(subject, {
  accessToken: config.accessToken
});
const ctidTraderAccountId = 5291983;
const accAuth = accountAuth(subject, {
  accessToken: config.accessToken,
  ctidTraderAccountId
});
const v = cancelOrder(subject, { ctidTraderAccountId, orderId: 6 });

concat(appAuth, accounts, accAuth, v).subscribe(
  next => console.log("_next", next),
  error => console.log("_error", error),
  () => console.log("_complete")
);
