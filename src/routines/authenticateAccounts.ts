import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { flatMap, map } from "rxjs/operators";

import util from "../util";

export function authenticateAccounts(
  payload: Omit<$.ProtoOAAccountAuthReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2150, $.ProtoMessage2102> {
  return pipe(
    flatMap(pm => pm.payload.ctidTraderAccount),
    map(({ ctidTraderAccountId }) =>
      util.accountAuth({ ...payload, ctidTraderAccountId })
    )
  );
}
