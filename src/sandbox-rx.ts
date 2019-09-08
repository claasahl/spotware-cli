import { concat, timer, of } from "rxjs";
import { map, mapTo, filter, flatMap, pairwise } from "rxjs/operators";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import {
  applicationAuth,
  accountAuth,
  subscribeSpots,
  subscribeLiveTrendbar
} from "./requests";
import {
  ProtoOATrendbarPeriod,
  ProtoOAPayloadType,
  ProtoMessage2131
} from "@claasahl/spotware-adapter";
import { pm51 } from "./utils";
import { trendbar } from "./operators";

// https://youtu.be/8CNVYWiR5fg?t=378

const symbolId = 22396;
const period = ProtoOATrendbarPeriod.M1;

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
  .subscribe(console.log);

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
).subscribe();
