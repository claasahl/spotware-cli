import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";

import { Recommendation } from "./signals";
import {
  debounceTime,
  distinctUntilChanged,
  tap,
  filter,
  map
} from "rxjs/operators";
import { volume, pips, pm2106 } from "../../utils";

export function tradeStrategy(
  ctidTraderAccountId: number,
  symbolId: number,
  volumeInLots: number,
  stopLossInPips: number,
  takeProfitInPips: number
): OperatorFunction<Recommendation, $.ProtoMessages> {
  return pipe(
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
          return pm2106({
            ...order,
            tradeSide: $.ProtoOATradeSide.BUY
          });
        case "STRONGER BUY":
          return pm2106({
            ...order,
            tradeSide: $.ProtoOATradeSide.BUY,
            volume: order.volume * 2
          });
        case "SELL":
          return pm2106({
            ...order,
            tradeSide: $.ProtoOATradeSide.SELL
          });
        case "STRONGER SELL":
          return pm2106({
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
  );
}
