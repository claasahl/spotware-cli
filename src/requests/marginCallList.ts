import {
  ProtoOAPayloadType,
  ProtoMessage2168,
  ProtoOAMarginCallListReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2167 } from "../utils";

export function marginCallList(
  subject: SpotwareSubject,
  payload: ProtoOAMarginCallListReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2167(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2168 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default marginCallList;
