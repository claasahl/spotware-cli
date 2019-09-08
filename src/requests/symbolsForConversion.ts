import {
  ProtoOAPayloadType,
  ProtoOASymbolsForConversionReq,
  ProtoMessage2119
} from "@claasahl/spotware-adapter";
import { of, EMPTY, race, concat } from "rxjs";
import { tap, flatMap, filter, take } from "rxjs/operators";

import { SpotwareSubject } from "../spotwareSubject";
import { error } from "./errorUtil";
import { pm2118 } from "../utils";

export function symbolsForConversion(
  subject: SpotwareSubject,
  payloadType: ProtoOASymbolsForConversionReq,
  timeout?: number,
  msgId: string = `${Date.now()}`
) {
  const request = of(pm2118(payloadType, msgId)).pipe(
    tap(pm => subject.next(pm)),
    flatMap(() => EMPTY)
  );
  const response = subject.pipe(
    filter(
      (pm): pm is ProtoMessage2119 =>
        pm.payloadType ===
          ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_RES &&
        pm.clientMsgId === msgId
    ),
    take(1)
  );
  const result = race(response, error(subject, msgId, timeout));
  return concat(request, result);
}
export default symbolsForConversion;
