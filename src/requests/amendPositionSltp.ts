import {
  ProtoOAPayloadType,
  ProtoOAAmendPositionSLTPReq,
  ProtoMessage2126
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2110 } from "../utils";

export function amendPositionSltp(
  subject: SpotwareSubject,
  payload: ProtoOAAmendPositionSLTPReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2110(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2126 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default amendPositionSltp;
