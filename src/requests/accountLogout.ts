import {
  ProtoOAPayloadType,
  ProtoOAAccountLogoutReq,
  ProtoMessage2163
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2162 } from "../utils";

export function accountLogout(
  subject: SpotwareSubject,
  payload: ProtoOAAccountLogoutReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2162(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2163 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default accountLogout;
