import {
  ProtoOAPayloadType,
  ProtoMessage2165,
  ProtoOASubscribeLiveTrendbarReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2135 } from "../utils";

export function subscribeLiveTrendbar(
  subject: SpotwareSubject,
  payload: ProtoOASubscribeLiveTrendbarReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2135(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2165 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default subscribeLiveTrendbar;
