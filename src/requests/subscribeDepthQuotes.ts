import {
  ProtoOAPayloadType,
  ProtoOASubscribeDepthQuotesReq,
  ProtoMessage2157
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2156 } from "../utils";

export function subscribeDepthQuotes(
  subject: SpotwareSubject,
  payload: ProtoOASubscribeDepthQuotesReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2156(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2157 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default subscribeDepthQuotes;
