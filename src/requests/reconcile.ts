import {
  ProtoOAPayloadType,
  ProtoOAReconcileReq,
  ProtoMessage2125
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2124 } from "../utils";

export function reconcile(
  subject: SpotwareSubject,
  payload: ProtoOAReconcileReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2124(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2125 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_RECONCILE_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default reconcile;
