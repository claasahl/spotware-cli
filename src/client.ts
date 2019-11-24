import SpotwareSubject from "./testSubject";

import config from "./config";
import { subscribeSpots, symbolsList, symbolById } from "./requests";
import { concat, Subject, timer, Observable } from "rxjs";
import { map, filter, pairwise, mapTo, flatMap, first } from "rxjs/operators";
import {
  ProtoOAPayloadType,
  ProtoMessage2131,
  ProtoOASymbol
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
const subject = new SpotwareSubject(
  { clientId, clientSecret, accessToken },
  { port, host }
);

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
  subject.authenticate(),
  subject.accounts(),
  spotz(subject, "BTC/EUR")
).subscribe();

function lookupSymbol(
  subject: SpotwareSubject,
  symbol: string
): Observable<ProtoOASymbol> {
  const lookupSymbolId = symbolsList(subject, { ctidTraderAccountId }).pipe(
    flatMap(pm => pm.payload.symbol),
    filter(({ symbolName }) => symbolName === symbol),
    map(symbol => symbol.symbolId),
    first()
  );

  const lookupSymbol = lookupSymbolId.pipe(
    flatMap(symbolId =>
      symbolById(subject, { ctidTraderAccountId, symbolId: [symbolId] })
    ),
    flatMap(pm => pm.payload.symbol),
    first()
  );
  return lookupSymbol;
}

function spotz(subject: SpotwareSubject, symbol: string) {
  const lookupSymbolId = lookupSymbol(subject, symbol).pipe(
    map(symbol => symbol.symbolId)
  );

  const subscribeToSymbol = lookupSymbolId.pipe(
    flatMap(symbolId =>
      subscribeSpots(subject, { ctidTraderAccountId, symbolId: [symbolId] })
    )
  );

  return concat(subscribeToSymbol);
}
