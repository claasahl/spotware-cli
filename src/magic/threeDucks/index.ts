import * as $ from "@claasahl/spotware-adapter";
import { Observable } from "rxjs";
import { share, filter, map } from "rxjs/operators";

import { trendbars } from "../trendbars";
import { when } from "../../operators";
import { signals } from "./signals";
import { tradeStrategy } from "./tradeStrategy";

export function threeDucks(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  ctidTraderAccountId: number,
  symbolId: number,
  volumeInLots: number,
  stopLossInPips: number,
  takeProfitInPips: number,
  smaPeriod: number = 60
): void {
  const M5 = trendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.M5,
    smaPeriod * 2
  ).pipe(share());
  const H1 = trendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H1,
    smaPeriod * 2
  ).pipe(share());
  const H4 = trendbars(
    incomingProtoMessages,
    output,
    ctidTraderAccountId,
    symbolId,
    $.ProtoOATrendbarPeriod.H4,
    smaPeriod * 2
  ).pipe(share());
  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    map(pm => pm.payload.bid),
    filter((data): data is number => typeof data === "number")
  );
  signals(H4, H1, M5, live, smaPeriod)
    .pipe(
      tradeStrategy(
        ctidTraderAccountId,
        symbolId,
        volumeInLots,
        stopLossInPips,
        takeProfitInPips
      )
    )
    .subscribe(output);
}
