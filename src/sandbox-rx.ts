import { concat } from "rxjs";
import { map } from "rxjs/operators";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import { applicationAuth, getAccountsByAccessToken } from "./requests";

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
const auth = applicationAuth(
  subject,
  config.clientId,
  config.clientSecret,
  2000
);
const accounts = getAccountsByAccessToken(subject, config.accessToken, 2000);

concat(auth, accounts).subscribe(
  next => console.log("_next", next),
  error => console.log("_error", error),
  () => console.log("_complete")
);
