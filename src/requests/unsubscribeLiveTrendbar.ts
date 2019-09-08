import {
  ProtoOAPayloadType,
  ProtoMessage2166,
  ProtoOAUnsubscribeLiveTrendbarReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2136 } from "../utils";

export function unsubscribeLiveTrendbar(
  subject: SpotwareSubject,
  payload: ProtoOAUnsubscribeLiveTrendbarReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2136(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2166 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default unsubscribeLiveTrendbar;
