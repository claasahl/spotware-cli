import {
  ProtoOAPayloadType,
  ProtoOAAssetListReq,
  ProtoMessage2113
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2112 } from "../utils";

export function assetList(
  subject: SpotwareSubject,
  payload: ProtoOAAssetListReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2112(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2113 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default assetList;
