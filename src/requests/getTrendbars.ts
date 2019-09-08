import {
  ProtoOAPayloadType,
  ProtoMessage2138,
  ProtoOAGetTrendbarsReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2137 } from "../utils";

export function getTrendbars(
  subject: SpotwareSubject,
  payload: ProtoOAGetTrendbarsReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2137(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2138 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default getTrendbars;
