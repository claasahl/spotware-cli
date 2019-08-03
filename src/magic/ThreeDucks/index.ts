import * as $ from "@claasahl/spotware-adapter";
import { Observable } from "rxjs";
import {
  share,
  filter,
  map,
  tap,
  debounceTime,
  distinctUntilChanged
} from "rxjs/operators";

import { trendbars } from "../trendbars";
import { when } from "../../operators";
import util from "../../util";
import { strategy } from "./strategy";

// FIXME hardcoded ids
const BTCEUR = 22396;
const GBPSEK = 10093;
const EURGBP = 9;
const EURSEK = 47;
function volume(symbolId: number, volume: number): number {
  switch (symbolId) {
    case GBPSEK:
    case EURGBP:
    case EURSEK:
      return volume * 10000000;
    case BTCEUR:
    default:
      return volume * 100;
  }
}

function pips(symbolId: number, pips: number): number {
  switch (symbolId) {
    case GBPSEK:
    case EURGBP:
    case EURSEK:
      return pips * 10;
    case BTCEUR:
      return pips * 10000;
    default:
      return pips;
  }
}

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
  strategy(H4, H1, M5, live, smaPeriod)
    .pipe(
      debounceTime(500),
      distinctUntilChanged((x, y) => x === y),
      tap(result => {
        const date = new Date();
        console.log(date, "DUCKS", JSON.stringify(result));
      }),
      filter(result => result !== "NEUTRAL"),
      map(result => {
        const order: $.ProtoOANewOrderReq = {
          ctidTraderAccountId,
          symbolId,
          orderType: $.ProtoOAOrderType.MARKET,
          tradeSide: $.ProtoOATradeSide.BUY,
          volume: volume(symbolId, volumeInLots),
          relativeStopLoss: pips(symbolId, stopLossInPips),
          relativeTakeProfit: pips(symbolId, takeProfitInPips)
        };
        switch (result) {
          case "BUY":
            return util.newOrder({
              ...order,
              tradeSide: $.ProtoOATradeSide.BUY
            });
          case "STRONGER BUY":
            return util.newOrder({
              ...order,
              tradeSide: $.ProtoOATradeSide.BUY,
              volume: order.volume * 2
            });
          case "SELL":
            return util.newOrder({
              ...order,
              tradeSide: $.ProtoOATradeSide.SELL
            });
          case "STRONGER SELL":
            return util.newOrder({
              ...order,
              tradeSide: $.ProtoOATradeSide.SELL,
              volume: order.volume * 2
            });
          default:
            throw new Error(`unknown result: ${result}`);
        }
      }),
      tap(result => {
        const date = new Date();
        console.log(date, "DUCKS", JSON.stringify(result));
      })
    )
    .subscribe(output);
}
