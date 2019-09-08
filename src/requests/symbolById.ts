import {
  ProtoOAPayloadType,
  ProtoOASymbolByIdReq,
  ProtoMessage2117
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2116 } from "../utils";

export function symbolById(
  subject: SpotwareSubject,
  payload: ProtoOASymbolByIdReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2116(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2117 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default symbolById;
