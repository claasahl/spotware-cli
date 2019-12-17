import { ProtoOATradeSide } from "@claasahl/spotware-adapter";
import { concat, merge, Subject, from } from "rxjs";
import {
  map,
  pairwise,
  filter,
  tap,
  flatMap,
  withLatestFrom
} from "rxjs/operators";
import { bullish, bearish, range } from "indicators";

import config from "./config";
import SpotwareSubject from "./testSubject";
import { Trendbar } from "./types";

function main() {
  const { port, host, clientId, clientSecret, accessToken } = config;
  const {
    label,
    symbol,
    volume,
    period,
    expirationOffset,
    enterOffset,
    stopLossOffset,
    takeProfitOffset
  } = config;
  const subject = new SpotwareSubject(
    { clientId, clientSecret, accessToken },
    { port, host }
  );

  type Match = Trendbar & {
    tradeSide: ProtoOATradeSide;
    enter: number;
    stopLoss: number;
    takeProfit: number;
  };
  const matches = new Subject<Match>();
  const closeOrCancelOrders = new Subject<Match>();
  const newOrders = new Subject<Match>();

  const bullishMatches = subject.trendbars(symbol, period).pipe(
    pairwise(),
    filter(([first]) => bullish(first)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        tradeSide: ProtoOATradeSide.BUY,
        enter: roundPrice(candle.high + r * enterOffset),
        stopLoss: roundPrice(candle.high - r * stopLossOffset),
        takeProfit: roundPrice(candle.high + r * takeProfitOffset)
      };
    }),
    tap(trendbar => console.log("engulfed bullish trendbar", trendbar)),
    tap(matches)
  );

  const bearishMatches = subject.trendbars(symbol, period).pipe(
    pairwise(),
    filter(([first]) => bearish(first)),
    filter(([a, b]) => engulfed(a, b)),
    map(([first]) => first),
    map(candle => {
      const r = range(candle);
      return {
        ...candle,
        tradeSide: ProtoOATradeSide.SELL,
        enter: roundPrice(candle.low - r * enterOffset),
        stopLoss: roundPrice(candle.low + r * stopLossOffset),
        takeProfit: roundPrice(candle.low - r * takeProfitOffset)
      };
    }),
    tap(trendbar => console.log("engulfed bearish trendbar", trendbar)),
    tap(matches)
  );
  const closeOrders = closeOrCancelOrders.pipe(
    withLatestFrom(subject.openOrdersAndPositions(label)),
    flatMap(([_match, ordersAndPositions]) => {
      const reference = Date.now() - 10000;
      const { orders, positions } = ordersAndPositions;
      const orderIds = Object.values(orders)
        .filter(order => (order.utcLastUpdateTimestamp || 0) < reference)
        .map(order => order.orderId);
      const positionIds = Object.values(positions)
        .filter(position => (position.utcLastUpdateTimestamp || 0) < reference)
        .map(position => position.positionId);
      return merge(
        from(orderIds).pipe(
          flatMap(orderId => subject.cancelOrderr({ orderId }))
        ),
        from(positionIds).pipe(
          flatMap(positionId =>
            subject.closePositionn(symbol, { positionId, volume })
          )
        )
      );
    })
  );

  matches.subscribe(newOrders);
  matches
    .pipe(
      pairwise(),
      map(([prevMatch, _currMatch]) => prevMatch)
    )
    .subscribe(closeOrCancelOrders);
  const placeOrders = newOrders.pipe(
    flatMap(({ stopLoss, takeProfit, enter, tradeSide }) =>
      subject.limitOrder(symbol, {
        label,
        limitPrice: enter,
        stopLoss,
        takeProfit,
        volume,
        tradeSide,
        expirationTimestamp: Date.now() + expirationOffset
      })
    )
  );

  concat(
    subject.authenticate(),
    merge(
      subject.heartbeats(),
      bullishMatches,
      bearishMatches,
      placeOrders,
      closeOrders
    )
  ).subscribe(undefined, undefined, main);

  function engulfed(candleA: Trendbar, candleB: Trendbar): boolean {
    const upperA = candleA.high;
    const lowerA = candleA.low;
    const upperB = candleB.high;
    const lowerB = candleB.low;
    return (
      (upperA >= upperB && lowerA < lowerB) ||
      (upperA > upperB && lowerA <= lowerB)
    );
  }

  function roundPrice(price: number): number {
    return Math.round(price * 100) / 100;
  }
}
main();
