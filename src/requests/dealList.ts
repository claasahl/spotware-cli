import {
  ProtoOAPayloadType,
  ProtoOADealListReq,
  ProtoMessage2134
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2133 } from "../utils";

export function dealList(
  subject: SpotwareSubject,
  payload: ProtoOADealListReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2133(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2134 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default dealList;
