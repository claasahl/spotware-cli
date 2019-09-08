import {
  ProtoOAPayloadType,
  ProtoMessage2146,
  ProtoOAGetTickDataReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2145 } from "../utils";

export function getTickdata(
  subject: SpotwareSubject,
  payload: ProtoOAGetTickDataReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2145(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2146 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default getTickdata;
