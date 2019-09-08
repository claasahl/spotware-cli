import * as $ from "@claasahl/spotware-adapter";
import { race, EMPTY, of, concat } from "rxjs";
import { flatMap, filter, take, tap, map } from "rxjs/operators";

import config from "./config";
import { pm2100, pm2149 } from "./utils";

import { SpotwareSubject } from "./spotwareSubject";
import { error } from "./requests/errorUtil";

// https://youtu.be/8CNVYWiR5fg?t=378

function authenticateApplication(
  subject: SpotwareSubject,
  clientId: string,
  clientSecret: string,
  timeout: number = 2000
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2100({ clientId, clientSecret }, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2101 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}

function requestAccounts(
  subject: SpotwareSubject,
  accessToken: string,
  timeout: number = 2000
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2149({ accessToken }, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2150 =>
        pm.payloadType ===
          $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}

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
const auth = authenticateApplication(
  subject,
  config.clientId,
  config.clientSecret,
  2000
);
const accounts = requestAccounts(subject, config.accessToken, 2000);

concat(auth, accounts).subscribe(
  next => console.log("_next", next),
  error => console.log("_error", error),
  () => console.log("_complete")
);
