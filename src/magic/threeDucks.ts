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

export function threeDucks(
  incomingProtoMessages: Observable<$.ProtoMessages>,
  output: (pm: $.ProtoMessages) => void,
  symbolId: number,
  smaPeriod: number = 60
): void {
  const M1 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.M1,
    smaPeriod * 2
  ).pipe(share());
  const M15 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.M15,
    smaPeriod * 2
  ).pipe(share());
  const H1 = trendbars(
    incomingProtoMessages,
    output,
    symbolId,
    $.ProtoOATrendbarPeriod.H1,
    smaPeriod * 2
  ).pipe(share());

  M1.subscribe(value => {
    const date = new Date();
    console.log(date, "M1", JSON.stringify(value));
  });
  M15.subscribe(value => {
    const date = new Date();
    console.log(date, "M15", JSON.stringify(value));
  });
  H1.subscribe(value => {
    const date = new Date();
    console.log(date, "H1", JSON.stringify(value));
  });

  const live = incomingProtoMessages.pipe(
    when($.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT),
    filter(pm => pm.payload.symbolId === symbolId),
    map(pm => [pm.payload.bid, pm.payload.ctidTraderAccountId]),
    filter((data): data is number[] => typeof data[0] === "number")
  );
  const smaM1 = M1.pipe(SimpleMovingAverage(smaPeriod));
  const smaM15 = M15.pipe(SimpleMovingAverage(smaPeriod));
  const smaH1 = H1.pipe(SimpleMovingAverage(smaPeriod));
  combineLatest(
    smaH1,
    smaM15,
    smaM1,
    live,
    (h1, m15, m1, [live, ctidTraderAccountId]) => {
      console.log(
        symbolId,
        "||",
        h1.close < live,
        m15.close < live,
        m1.close < live,
        m1.high < live,
        "||",
        h1.close > live,
        m15.close > live,
        m1.close > live,
        m1.low > live
      );
      if (h1.close < live && m15.close < live && m1.close < live) {
        return [m1.high < live ? "STRONGER BUY" : "BUY", ctidTraderAccountId];
      }
      if (h1.close > live && m15.close > live && m1.close > live) {
        return [m1.low > live ? "STRONGER SELL" : "SELL", ctidTraderAccountId];
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
            // BTCEUR:
            // const MULTIPLIER = 10000;
            const MULTIPLIER = 1;
            const order: $.ProtoOANewOrderReq = {
              ctidTraderAccountId: t.key,
              symbolId,
              orderType: $.ProtoOAOrderType.MARKET,
              tradeSide: $.ProtoOATradeSide.BUY,
              volume: 100000,
              relativeStopLoss: 300 * MULTIPLIER,
              relativeTakeProfit: 600 * MULTIPLIER,
              trailingStopLoss: true
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
                  tradeSide: $.ProtoOATradeSide.BUY
                });
              case "SELL":
                return util.newOrder({
                  ...order,
                  tradeSide: $.ProtoOATradeSide.SELL
                });
              case "STRONGER SELL":
                return util.newOrder({
                  ...order,
                  tradeSide: $.ProtoOATradeSide.SELL
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
