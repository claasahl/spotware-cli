import * as $ from "@claasahl/spotware-adapter";
import { Observable, combineLatest } from "rxjs";
import {
  share,
  filter,
  map,
  groupBy,
  mergeMap,
  debounceTime,
  distinctUntilChanged,
  tap
} from "rxjs/operators";

import { trendbars } from "./trendbars";
import { when, SimpleMovingAverage } from "../operators";
import util from "../util";

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
  symbolId: number,
  volumeInLots: number,
  stopLossInPips: number,
  takeProfitInPips: number,
  smaPeriod: number = 60
): void {
  const M5 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.M5,
    smaPeriod * 2
  ).pipe(share());
  const H1 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.H1,
    smaPeriod * 2
  ).pipe(share());
  const H4 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.H4,
    smaPeriod * 2
  ).pipe(share());

  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    map(pm => [pm.payload.bid, pm.payload.ctidTraderAccountId]),
    filter((data): data is number[] => typeof data[0] === "number")
  );
  const smaM5 = M5.pipe(SimpleMovingAverage(smaPeriod));
  const smaH1 = H1.pipe(SimpleMovingAverage(smaPeriod));
  const smaH4 = H4.pipe(SimpleMovingAverage(smaPeriod));
  combineLatest(
    smaH4,
    smaH1,
    smaM5,
    live,
    (h4, h1, m5, [live, ctidTraderAccountId]) => {
      console.log(
        symbolId,
        "||",
        h4.close < live,
        h1.close < live,
        m5.close < live,
        "||",
        h4.close > live,
        h1.close > live,
        m5.close > live
      );
      if (h4.close < live && h1.close < live && m5.close < live) {
        return [m5.high < live ? "STRONGER BUY" : "BUY", ctidTraderAccountId];
      }
      if (h4.close > live && h1.close > live && m5.close > live) {
        return [m5.low > live ? "STRONGER SELL" : "SELL", ctidTraderAccountId];
      }
      return undefined;
    }
  )
    .pipe(
      filter(
        (result): result is [string, number] => typeof result !== "undefined"
      ),
      groupBy(([_result, ctidTraderAccountId]) => ctidTraderAccountId),
      mergeMap(t =>
        t.pipe(
          map(([result, _]) => result),
          debounceTime(500),
          distinctUntilChanged((x, y) => x === y),
          tap(result => {
            const date = new Date();
            console.log(date, "DUCKS", JSON.stringify(result));
          }),
          map(result => {
            const order: $.ProtoOANewOrderReq = {
              ctidTraderAccountId: t.key,
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
      )
    )
    .subscribe(output);
}
