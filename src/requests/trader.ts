import {
  ProtoOAPayloadType,
  ProtoOATraderReq,
  ProtoMessage2122
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2121 } from "../utils";

export function trader(
  subject: SpotwareSubject,
  payloadType: ProtoOATraderReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2121(payloadType, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2122 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_TRADER_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default trader;
