import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";

import util from "../util";

export function subscribeSpots(
  payload: Omit<$.ProtoOASubscribeSpotsReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2127> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.subscribeSpots({ ...payload, ctidTraderAccountId })
    )
  );
}
