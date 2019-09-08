import {
  ProtoOAPayloadType,
  ProtoOAExpectedMarginReq,
  ProtoMessage2140
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2139 } from "../utils";

export function expectedMargin(
  subject: SpotwareSubject,
  payload: ProtoOAExpectedMarginReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2139(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2140 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default expectedMargin;
