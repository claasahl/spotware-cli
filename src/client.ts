import { SpotwareSubject } from "./spotwareSubject";

import config from "./config";
import {
  applicationAuth,
  accountAuth,
  subscribeSpots,
  symbolsList
} from "./requests";
import { concat, Subject, timer } from "rxjs";
import { map, filter, pairwise, mapTo, flatMap, first } from "rxjs/operators";
import {
  ProtoOAPayloadType,
  ProtoMessage2131
} from "@claasahl/spotware-adapter";
import { pm51 } from "./utils";

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
const subject = new SpotwareSubject(port, host);

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

timer(10000, 10000)
  .pipe(mapTo(pm51({})))
  .subscribe(subject);

concat(
  applicationAuth(subject, { clientId, clientSecret }),
  accountAuth(subject, { accessToken, ctidTraderAccountId }),
  spotz(subject, "BTC/EUR")
).subscribe();

function spotz(subject: SpotwareSubject, symbol: string) {
  const lookupSymbolId = symbolsList(subject, { ctidTraderAccountId }).pipe(
    flatMap(pm =>
      pm.payload.symbol.filter(({ symbolName }) => symbol === symbolName)
    ),
    first(),
    map(symbol => symbol.symbolId)
  );

  const subscribeToSymbol = lookupSymbolId.pipe(
    flatMap(symbolId =>
      subscribeSpots(subject, { ctidTraderAccountId, symbolId: [symbolId] })
    )
  );

  return concat(subscribeToSymbol);
}
