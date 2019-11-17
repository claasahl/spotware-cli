import { SpotwareSubject } from "./spotwareSubject";

import config from "./config";
import { applicationAuth, accountAuth, subscribeSpots } from "./requests";
import { concat, Subject } from "rxjs";
import { map, filter, pairwise } from "rxjs/operators";
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

spots.subscribe(console.log);

concat(
  applicationAuth(subject, { clientId, clientSecret }),
  accountAuth(subject, { accessToken, ctidTraderAccountId }),
  subscribeSpots(subject, { ctidTraderAccountId, symbolId: [BTCEUR] })
).subscribe();
