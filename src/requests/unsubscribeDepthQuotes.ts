import {
  ProtoOAPayloadType,
  ProtoMessage2159,
  ProtoOAUnsubscribeDepthQuotesReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2158 } from "../utils";

export function unsubscribeDepthQuotes(
  subject: SpotwareSubject,
  payload: ProtoOAUnsubscribeDepthQuotesReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2158(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2159 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default unsubscribeDepthQuotes;
