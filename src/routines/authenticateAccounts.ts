import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { flatMap, map } from "rxjs/operators";

import { pm2102 } from "../utils";

export function authenticateAccounts(
  payload: Omit<$.ProtoOAAccountAuthReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2150, $.ProtoMessage2102> {
  return pipe(
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      pm2102({ ...payload, ctidTraderAccountId })
    )
  );
}
