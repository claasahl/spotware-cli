import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, pipe } from "rxjs";

import {
  debounceTime,
  distinctUntilChanged,
  tap,
  filter,
  map
} from "rxjs/operators";
import { volume, pips, pm2106 } from "../../utils";
import { Recommendation } from "../../types";

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
        case "SELL":
          return pm2106({
            ...order,
            tradeSide: $.ProtoOATradeSide.SELL
          });
        default:
          throw new Error(`unknown result: ${result}`);
      }
    })
  );
}
