import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";

import util from "../util";

export function requestSymbols(
  payload: Omit<$.ProtoOASymbolsListReq, "ctidTraderAccountId">
): OperatorFunction<$.ProtoMessage2103, $.ProtoMessage2114> {
  return pipe(
    map(pm => pm.payload.ctidTraderAccountId),
    map(ctidTraderAccountId =>
      util.symbolsList({ ...payload, ctidTraderAccountId })
    )
  );
}
