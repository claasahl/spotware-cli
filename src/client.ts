import { SpotwareSubject } from "./spotwareSubject";

import config from "./config";
import { applicationAuth, accountAuth, subscribeSpots } from "./requests";
import { concat, Subject, timer } from "rxjs";
import { map, filter, pairwise, mapTo, scan } from "rxjs/operators";
import {
  ProtoOAPayloadType,
  ProtoMessage2131,
  ProtoOATrendbarPeriod
} from "@claasahl/spotware-adapter";
import { pm51, periodToMillis } from "./utils";

const {
  port,
  host,
  clientId,
  clientSecret,
  accessToken,
  ctidTraderAccountId
} = config;
const BTCEUR = 22396;
const period = ProtoOATrendbarPeriod.M1;
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
    filter(pm => pm.payload.symbolId === BTCEUR), // <---
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
            open: price,
            high: price,
            low: price,
            close: price,
            symbolId: curr.symbolId,
            ctidTraderAccountId: curr.ctidTraderAccountId
          };
        }
      },
      {
        date: new Date(0),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        symbolId: BTCEUR,
        ctidTraderAccountId
      }
    )
  )
  .subscribe(console.log);

timer(10000, 10000)
  .pipe(mapTo(pm51({})))
  .subscribe(subject);

concat(
  applicationAuth(subject, { clientId, clientSecret }),
  accountAuth(subject, { accessToken, ctidTraderAccountId }),
  subscribeSpots(subject, { ctidTraderAccountId, symbolId: [BTCEUR] })
).subscribe();
