import {
  ProtoOAPayloadType,
  ProtoOAMarginCallUpdateReq,
  ProtoMessage2170
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2169 } from "../utils";

export function marginCallUpdate(
  subject: SpotwareSubject,
  payload: ProtoOAMarginCallUpdateReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2169(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2170 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default marginCallUpdate;
