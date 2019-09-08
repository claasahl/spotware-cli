import {
  ProtoOAPayloadType,
  ProtoOAVersionReq,
  ProtoMessage2105
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2104 } from "../utils";

export function version(
  subject: SpotwareSubject,
  payload: ProtoOAVersionReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2104(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2105 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_VERSION_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default version;
