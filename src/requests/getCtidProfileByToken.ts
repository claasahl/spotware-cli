import {
  ProtoOAPayloadType,
  ProtoMessage2152,
  ProtoOAGetCtidProfileByTokenReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2151 } from "../utils";

export function getCtidProfileByToken(
  subject: SpotwareSubject,
  payload: ProtoOAGetCtidProfileByTokenReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2151(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2152 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default getCtidProfileByToken;
