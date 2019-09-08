import {
  ProtoOAPayloadType,
  ProtoMessage2154,
  ProtoOAAssetClassListReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2153 } from "../utils";

export function assetClassList(
  subject: SpotwareSubject,
  payload: ProtoOAAssetClassListReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2153(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2154 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default assetClassList;
