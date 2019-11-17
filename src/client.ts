import { SpotwareSubject } from "./spotwareSubject";

import config from "./config";
import {
  applicationAuth,
  accountAuth,
  subscribeSpots,
  newOrder
} from "./requests";
import { concat, Subject, timer } from "rxjs";
import {
  map,
  filter,
  pairwise,
  mapTo,
  scan,
  tap,
  flatMap
} from "rxjs/operators";
import {
  ProtoOAPayloadType,
  ProtoMessage2131,
  ProtoOATrendbarPeriod,
  ProtoOATradeSide,
  ProtoOAOrderType
} from "@claasahl/spotware-adapter";
import { pm51, periodToMillis, price, volume } from "./utils";
import { Trendbar } from "./types";
import { bullish, Candle, upper, lower, range, bearish } from "indicators";

const {
  port,
  host,
  clientId,
  clientSecret,
  accessToken,
  ctidTraderAccountId
} = config;
const BTCEUR = 22396;
const symbolId = BTCEUR;
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
const subject = new SpotwareSubject(port, host);

subject
  .pipe(
    map(pm => ({ date: new Date(), pm })),
    map(msg => JSON.stringify(msg, null, 2))
  )
  .subscribe(console.log);

interface Spot {
  ask: number;
  bid: number;
  symbolId: number;
  ctidTraderAccountId: number;
  date: Date;
}
const spots = new Subject<Spot>();
subject
  .pipe(
    filter(
      (pm): pm is ProtoMessage2131 =>
        pm.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT
    ),
    filter(pm => pm.payload.ctidTraderAccountId === ctidTraderAccountId),
    filter(pm => !!(pm.payload.ask || pm.payload.bid)),
    filter(pm => pm.payload.symbolId === symbolId), // <---
    map(({ payload: { ask, bid, ctidTraderAccountId, symbolId } }) => ({
      ask,
      bid,
      symbolId,
      ctidTraderAccountId,
      date: new Date()
    })),
    pairwise(),
    map(([left, right]) => {
      const spot = { ...right };
      if (!spot.ask) {
        spot.ask = left.ask;
      }
      if (!spot.bid) {
        spot.bid = left.bid;
      }
      return spot;
    }),
    filter((spot): spot is Spot => !!(spot.ask && spot.bid))
  )
  .subscribe(spots);
function periodStart(date: Date, period: ProtoOATrendbarPeriod): Date {
  const timestamp = date.getTime();
  const millis = periodToMillis(period);
  const periodStart = Math.floor(timestamp / millis) * millis;
  return new Date(periodStart);
}

spots
  .pipe(
    map(spot => ({ ...spot, periodStart: periodStart(spot.date, period) })),
    scan(
      (acc, curr) => {
        const price = curr.bid;
        if (acc.date.getTime() === curr.periodStart.getTime()) {
          const trendbar = { ...acc };
          trendbar.close = price;
          if (trendbar.high < price) {
            trendbar.high = price;
          }
          if (trendbar.low > price) {
            trendbar.low = price;
          }
          return trendbar;
        } else {
          return {
            date: curr.periodStart,
            timestamp: curr.periodStart.getTime(),
            open: price,
            high: price,
            low: price,
            close: price,
            symbolId: curr.symbolId,
            ctidTraderAccountId: curr.ctidTraderAccountId,
            volume: 0,
            period
          };
        }
      },
      {
        date: new Date(0),
        timestamp: 0,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        symbolId: 0,
        ctidTraderAccountId: 0,
        volume: 0,
        period
      }
    ),
    pairwise(),
    filter(([left, right]) => left.timestamp !== right.timestamp),
    map(([left, _right]) => left)
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
        orderType: ProtoOAOrderType.LIMIT,
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
  applicationAuth(subject, { clientId, clientSecret }),
  accountAuth(subject, { accessToken, ctidTraderAccountId }),
  subscribeSpots(subject, { ctidTraderAccountId, symbolId: [symbolId] })
).subscribe();

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
