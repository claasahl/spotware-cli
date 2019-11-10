import {
  ProtoOATrendbarPeriod,
  ProtoOAOrderType,
  ProtoOATradeSide
} from "@claasahl/spotware-adapter";
import { concat, timer, of, Subject } from "rxjs";
import { map, mapTo, filter, flatMap, pairwise, tap } from "rxjs/operators";
import { bullish, Candle, upper, lower, bearish, range } from "indicators";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import {
  applicationAuth,
  accountAuth,
  getTrendbars,
  newOrder
} from "./requests";
import { pm51, volume, price } from "./utils";
import { trendbar } from "./operators";
import { Trendbar } from "./types";

// https://youtu.be/8CNVYWiR5fg?t=378

const symbolId = 22396;
const period = ProtoOATrendbarPeriod.M1;
const enterOffset = 0.1;
const stopLossOffset = 0.4;
const takeProfitOffset = 0.8;

type Match = Trendbar & {
  tradeSide: ProtoOATradeSide;
  enter: number;
  stopLoss: number;
  takeProfit: number;
};
const matches = new Subject<Match>();
const closeOrCancelOrders = new Subject<Match>();
const newOrders = new Subject<Match>();

const trendbars = new Subject<Trendbar>();
const subject = new SpotwareSubject(config.port, config.host);
subject
  .pipe(
    map(pm => {
      const date = new Date();
      return { timestamp: date.getTime(), date, msg: pm };
    })
  )
  .subscribe(
    next => console.log(JSON.stringify(next)),
    error => console.log("error", error),
    () => console.log("complete")
  );

timer(30000, 60000)
  .pipe(
    flatMap(() => {
      const date = new Date();
      date.setMilliseconds(0);
      date.setSeconds(0);
      const toTimestamp = date.getTime();
      const fromTimestamp = toTimestamp - 60 * 1000;
      return getTrendbars(subject, {
        ctidTraderAccountId: config.ctidTraderAccountId,
        symbolId,
        period,
        fromTimestamp,
        toTimestamp
      });
    }),
    flatMap(pm => pm.payload.trendbar),
    trendbar(period),
    pairwise(),
    filter(([a, b]) => a.timestamp !== b.timestamp),
    flatMap(([a, _b]) => of(a))
  )
  .subscribe(trendbars);

trendbars
  .pipe(
    pairwise(),
    filter(([first]) => bullish(first)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        tradeSide: ProtoOATradeSide.BUY,
        enter: price(symbolId, candle.high + r * enterOffset),
        stopLoss: price(symbolId, candle.high - r * stopLossOffset),
        takeProfit: price(symbolId, candle.high + r * takeProfitOffset)
      };
    }),
    tap(trendbar => console.log("engulfed bullish trendbar", trendbar))
  )
  .subscribe(matches);

trendbars
  .pipe(
    pairwise(),
    filter(([first]) => bearish(first)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        tradeSide: ProtoOATradeSide.SELL,
        enter: price(symbolId, candle.low - r * enterOffset),
        stopLoss: price(symbolId, candle.low + r * stopLossOffset),
        takeProfit: price(symbolId, candle.low - r * takeProfitOffset)
      };
    }),
    tap(trendbar => console.log("engulfed bearish trendbar", trendbar))
  )
  .subscribe(matches);

matches.subscribe(newOrders);
matches
  .pipe(
    pairwise(),
    map(([prevMatch, _currMatch]) => prevMatch)
  )
  .subscribe(closeOrCancelOrders);
newOrders
  .pipe(
    flatMap(({ stopLoss, takeProfit, enter, tradeSide }) =>
      newOrder(subject, {
        orderType: ProtoOAOrderType.STOP_LOSS_TAKE_PROFIT,
        label: "123",
        comment: "456",
        ctidTraderAccountId: config.ctidTraderAccountId,
        limitPrice: enter,
        stopLoss,
        takeProfit,
        symbolId,
        volume: volume(symbolId, 0.1),
        tradeSide
      })
    )
  )
  .subscribe(console.log);
// closeOrCancelOrders -> look for pm2126 -> filter by label?

timer(10000, 10000)
  .pipe(mapTo(pm51({})))
  .subscribe(subject);

concat(
  applicationAuth(subject, {
    clientId: config.clientId,
    clientSecret: config.clientSecret
  }),
  accountAuth(subject, {
    accessToken: config.accessToken,
    ctidTraderAccountId: config.ctidTraderAccountId
  })
).subscribe(null, console.error);

function engulfed(candleA: Candle, candleB: Candle): boolean {
  const upperA = upper(candleA);
  const lowerA = lower(candleA);
  const upperB = upper(candleB);
  const lowerB = lower(candleB);
  return (
    (upperA >= upperB && lowerA < lowerB) ||
    (upperA > upperB && lowerA <= lowerB)
  );
}
