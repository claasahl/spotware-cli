import * as $ from "@claasahl/spotware-adapter";
import { filter, take, flatMap } from "rxjs/operators";
import { throwError, timer, race } from "rxjs";

import { SpotwareSubject } from "../spotwareSubject";

export function error(
  subject: SpotwareSubject,
  msgId: string,
  timeout: number = 2000
) {
  const error = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage50 =>
        pm.payloadType === $.ProtoPayloadType.ERROR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const protoOaError = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2142 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const protoOaOrderError = subject.pipe(
    filter(
      (pm): pm is $.ProtoMessage2132 =>
        pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_ORDER_ERROR_EVENT &&
        pm.clientMsgId === msgId
    ),
    take(1),
    flatMap(pm => throwError(new Error(JSON.stringify(pm))))
  );
  const noResponse = timer(timeout).pipe(
    take(1),
    flatMap(() => throwError(new Error("no timely response")))
  );
  return race(error, protoOaError, protoOaOrderError, noResponse);
}
