import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";

import { pm2127 } from "../utils";

export function subscribeSpots(
  payload: Omit<$.ProtoOASubscribeSpotsReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2127> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId => pm2127({ ...payload, ctidTraderAccountId }))
  );
}
