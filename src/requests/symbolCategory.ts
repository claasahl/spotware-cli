import {
  ProtoOAPayloadType,
  ProtoOASymbolCategoryListReq,
  ProtoMessage2161
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2160 } from "../utils";

export function symbolCategory(
  subject: SpotwareSubject,
  payload: ProtoOASymbolCategoryListReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2160(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2161 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default symbolCategory;
