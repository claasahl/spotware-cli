import {
  ProtoOAPayloadType,
  ProtoOAAccountAuthReq,
  ProtoMessage2103
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2102 } from "../utils";

export function accountAuth(
  subject: SpotwareSubject,
  payload: ProtoOAAccountAuthReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2102(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2103 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default accountAuth;
