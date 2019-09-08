import {
  ProtoOAPayloadType,
  ProtoMessage2150
} from "@claasahl/spotware-adapter";
import { of, EMPTY, concat, race } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { pm2149 } from "../utils";
import { error } from "./errorUtil";

export function getAccountsByAccessToken(
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
      (pm): pm is ProtoMessage2150 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default getAccountsByAccessToken;
