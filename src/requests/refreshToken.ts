import {
  ProtoOAPayloadType,
  ProtoOARefreshTokenReq,
  ProtoMessage2174
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2173 } from "../utils";

export function refreshToken(
  subject: SpotwareSubject,
  payload: ProtoOARefreshTokenReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2173(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2174 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default refreshToken;
