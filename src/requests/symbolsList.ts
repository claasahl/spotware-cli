import {
  ProtoOAPayloadType,
  ProtoOASymbolsListReq,
  ProtoMessage2115
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2114 } from "../utils";

export function symbolsList(
  subject: SpotwareSubject,
  payloadType: ProtoOASymbolsListReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2114(payloadType, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2115 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default symbolsList;
