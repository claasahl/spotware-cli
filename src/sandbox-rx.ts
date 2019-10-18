import {
  ProtoOATrendbarPeriod,
  ProtoOAPayloadType,
  ProtoMessage2131
} from "@claasahl/spotware-adapter";
import { concat, timer, of, Subject } from "rxjs";
import { map, mapTo, filter, flatMap, pairwise, tap } from "rxjs/operators";
import { bullish, Candle, upper, lower, bearish, range } from "indicators";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import {
  applicationAuth,
  accountAuth,
  subscribeSpots,
  subscribeLiveTrendbar
} from "./requests";
import { pm51 } from "./utils";
import { trendbar } from "./operators";
import { Trendbar } from "./types";

// https://youtu.be/8CNVYWiR5fg?t=378

const symbolId = 22396;
const period = ProtoOATrendbarPeriod.M1;

const liveTrendbars = new Subject<Trendbar>();
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

subject
  .pipe(
    filter(
      (pm): pm is ProtoMessage2131 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT
    ),
    filter(pm => pm.payload.symbolId === symbolId),
    flatMap(pm => pm.payload.trendbar),
    filter(pm => pm.period === period),
    trendbar(period),
    pairwise(),
    filter(([a, b]) => a.timestamp !== b.timestamp),
    flatMap(([a, _b]) => of(a))
  )
  .subscribe(liveTrendbars);

liveTrendbars
  .pipe(
    pairwise(),
    filter(([first]) => bullish(first)),
    tap(trendbar => console.log("bullish trendbar", trendbar)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        enter: candle.high + r * 0.1,
        stopLoss: candle.high - r * 0.4,
        takeProfit: candle.high + r * 0.8
      };
    })
  )
  .subscribe(trendbar => console.log("engulfed bullish trendbar", trendbar));

liveTrendbars
  .pipe(
    pairwise(),
    filter(([first]) => bearish(first)),
    tap(trendbar => console.log("bearish trendbar", trendbar)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        enter: candle.low - r * 0.1,
        stopLoss: candle.low + r * 0.4,
        takeProfit: candle.low - r * 0.8
      };
    })
  )
  .subscribe(trendbar => console.log("engulfed bearish trendbar", trendbar));

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
  }),
  subscribeSpots(subject, {
    ctidTraderAccountId: config.ctidTraderAccountId,
    symbolId: [symbolId]
  }),
  subscribeLiveTrendbar(subject, {
    ctidTraderAccountId: config.ctidTraderAccountId,
    symbolId,
    period
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
