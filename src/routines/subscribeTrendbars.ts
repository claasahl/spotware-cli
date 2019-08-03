import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";

import { pm2135 } from "../utils";

export function subscribeTrendbars(
  payload: Omit<$.ProtoOASubscribeLiveTrendbarReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2128, $.ProtoMessage2135> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId => pm2135({ ...payload, ctidTraderAccountId }))
  );
}
