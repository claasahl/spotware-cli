import {
  ProtoOAPayloadType,
  ProtoMessage2128,
  ProtoOASubscribeSpotsReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2127 } from "../utils";

export function subscribeSpots(
  subject: SpotwareSubject,
  payload: ProtoOASubscribeSpotsReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2127(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2128 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default subscribeSpots;
