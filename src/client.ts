import SpotwareSubject from "./testSubject";

import config from "./config";
import { concat, Subject } from "rxjs";
import { map, filter, pairwise, flatMap } from "rxjs/operators";
import {
  ProtoOAPayloadType,
  ProtoMessage2131
} from "@claasahl/spotware-adapter";

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

concat(
  subject.authenticate(),
  subject
    .accounts()
    .pipe(
      flatMap(account => subject.symbol(account.ctidTraderAccountId, "BTC/EUR"))
    ),
  subject.heartbeats()
).subscribe();
