import {
  ProtoOAPayloadType,
  ProtoMessage2144,
  ProtoOACashFlowHistoryListReq
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2143 } from "../utils";

export function cashFlowHistoryList(
  subject: SpotwareSubject,
  payload: ProtoOACashFlowHistoryListReq,
  timeout?: number
) {
  const msgId = `${Date.now()}`;

  const request = of(pm2143(payload, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2144 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default cashFlowHistoryList;
