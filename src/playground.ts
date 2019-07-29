import {
  fromEvent,
  Subject,
  pipe,
  of,
  EMPTY,
  interval,
  combineLatest,
  merge,
  ReplaySubject,
  timer,
  concat
} from "rxjs";
import {
  tap,
  share,
  first,
  flatMap,
  map,
  filter,
  scan,
  toArray,
  min,
  multicast,
  takeWhile,
  concatMap
} from "rxjs/operators";
import * as $ from "@claasahl/spotware-adapter";

import CONFIG from "./config";
import UTIL from "./util";
import { ProtoMessages, ProtoOAQuoteType } from "@claasahl/spotware-adapter";

const {
  PROTO_OA_APPLICATION_AUTH_RES,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES,
  PROTO_OA_GET_TICKDATA_RES
} = $.ProtoOAPayloadType;

const { host, port, clientId, clientSecret, accessToken } = CONFIG;

const socket = $.connect(port, host);
const inputProtoMessages = fromEvent<$.ProtoMessages>(
  socket,
  "PROTO_MESSAGE.*"
).pipe(share());
inputProtoMessages
  .pipe(
    tap(message => {
      const date = new Date();
      console.log(
        JSON.stringify({ timestamp: date.getTime(), date, msg: message })
      );
    })
  )
  .subscribe(
    undefined,
    error => console.log("input", error),
    () => console.log("input", "completed")
  );

const outputProtoMessages = new Subject<$.ProtoMessages>();
outputProtoMessages
  .pipe(
    concatMap(pm => concat(of(pm), timer(333).pipe(flatMap(() => EMPTY)))),
    tap(message => $.write(socket, message))
  )
  .subscribe(
    undefined,
    error => console.log("input", error),
    () => console.log("input", "completed")
  );

function requestAccounts() {
  // request accounts after application was authenticated
  return pipe(
    pmFilter(PROTO_OA_APPLICATION_AUTH_RES),
    first(),
    map(() => UTIL.getAccountsByAccessToken({ accessToken }))
  );
}

function authenticateAccounts() {
  // authenticate accounts once they become available
  return pipe(
    pmFilter(PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    filter2150(), // TODO find another way to "cast" values/events
    first(),
    flatMap(message => of(...message.payload.ctidTraderAccount)),
    map(({ ctidTraderAccountId }) =>
      UTIL.pm2102({ accessToken, ctidTraderAccountId })
    )
  );
}

function requestInit(
  msgId: string,
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId">
  >
) {
  return pipe(
    pmFilter(PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
    filter2150(), // TODO find another way to "cast" values/events
    first(),
    flatMap(message => of(...message.payload.ctidTraderAccount)),
    map(({ ctidTraderAccountId }) =>
      UTIL.pm2145(
        { ...config, type: ProtoOAQuoteType.ASK, ctidTraderAccountId },
        msgId
      )
    )
  );
}
function requestRemaining(
  msgId: string,
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId">
  >
) {
  return pipe(
    pmFilter(PROTO_OA_GET_TICKDATA_RES),
    clientMsgId(msgId),
    filter2146(), // TODO find another way to "cast" values/events
    flatMap(pm => {
      // tick data is in reverse order (i.e. timestamp DESC)
      const { ctidTraderAccountId, hasMore, tickData } = pm.payload;
      if (!hasMore) {
        return EMPTY;
      }
      return of(...tickData).pipe(
        scan((acc, value) => {
          return {
            timestamp: acc.timestamp + value.timestamp,
            tick: acc.tick + value.tick
          };
        }),
        toArray(),
        map(ticks => ticks.reverse()),
        flatMap(value => of(...value)),
        min((x, y) => x.timestamp - y.timestamp),
        flatMap(pm =>
          of(
            UTIL.pm2145(
              {
                ...config,
                ctidTraderAccountId,
                toTimestamp: pm.timestamp
              },
              msgId
            )
          )
        )
      );
    })
  );
}
function tickData(
  msgId: string,
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId">
  >
) {
  return pipe(
    pmFilter(PROTO_OA_GET_TICKDATA_RES),
    clientMsgId(msgId),
    filter2146(), // TODO find another way to "cast" values/events
    takeWhile(pm => pm.payload.hasMore, true),
    toArray(),
    flatMap(value => of(...value.reverse())),
    flatMap(pm => {
      // tick data is in reverse order (i.e. timestamp DESC)
      const { tickData } = pm.payload;
      return of(...tickData).pipe(
        scan((acc, value) => {
          return {
            timestamp: acc.timestamp + value.timestamp,
            tick: acc.tick + value.tick
          };
        }),
        toArray(),
        map(ticks => ticks.reverse()),
        flatMap(value => of(...value)),
        map(tick => ({
          ...tick,
          date: new Date(tick.timestamp),
          type: config.type
        }))
      );
    }),
    toArray()
  );
}
function requestTickData(
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId" | "type">
  >
) {
  return pipe(
    multicast(new Subject<ProtoMessages>(), shared => {
      // ---------------- ASK
      const ASK = "ASK";
      const startAsk = shared.pipe(
        requestInit(ASK, { ...config, type: ProtoOAQuoteType.ASK })
      );
      const restAsk = shared.pipe(
        requestRemaining(ASK, { ...config, type: ProtoOAQuoteType.ASK })
      );
      const ask = merge(startAsk, restAsk);

      // ---------------- BID
      const BID = "BID";
      const startBid = shared.pipe(
        requestInit(BID, { ...config, type: ProtoOAQuoteType.BID })
      );
      const restBid = shared.pipe(
        requestRemaining(BID, { ...config, type: ProtoOAQuoteType.BID })
      );

      const bid = merge(startBid, restBid);

      // ---------------- ticks
      const ticksAsk = shared.pipe(
        tickData(ASK, { ...config, type: ProtoOAQuoteType.ASK })
      );
      const ticksBid = shared.pipe(
        tickData(BID, { ...config, type: ProtoOAQuoteType.BID })
      );
      combineLatest(ticksAsk, ticksBid, (ask, bid) => {
        const subject = new ReplaySubject<{
          timestamp: number;
          ask?: number;
          bid?: number;
        }>();
        let indexAsk = 0;
        let indexBid = 0;
        while (indexAsk <= ask.length && indexBid <= bid.length) {
          const tickAsk = ask[indexAsk];
          const tickBid = bid[indexBid];
          if (tickAsk && tickBid && tickAsk.timestamp === tickBid.timestamp) {
            subject.next({
              timestamp: tickAsk.timestamp,
              ask: tickAsk.tick,
              bid: tickBid.tick
            });
            indexAsk++;
            indexBid++;
          } else if (
            tickAsk &&
            tickBid &&
            tickAsk.timestamp < tickBid.timestamp
          ) {
            subject.next({ timestamp: tickAsk.timestamp, ask: tickAsk.tick });
            indexAsk++;
          } else if (
            tickAsk &&
            tickBid &&
            tickAsk.timestamp > tickBid.timestamp
          ) {
            subject.next({ timestamp: tickBid.timestamp, bid: tickBid.tick });
            indexBid++;
          } else if (tickAsk && !tickBid) {
            subject.next({ timestamp: tickAsk.timestamp, ask: tickAsk.tick });
            indexAsk++;
          } else if (!tickAsk && tickBid) {
            subject.next({ timestamp: tickBid.timestamp, bid: tickBid.tick });
            indexBid++;
          } else {
            indexAsk++;
            indexBid++;
          }
        }
        subject.complete();
        return subject;
      })
        .pipe(flatMap(value => value))
        .subscribe(tick => console.log(JSON.stringify(tick)));

      // ---------------- !!!
      return merge(ask, bid);
    })
  );
}

function authenticateApplication() {
  return of(UTIL.pm2100({ clientId, clientSecret }));
}

function heartbeats(period: number = 10000) {
  return interval(period).pipe(map(() => UTIL.pm51({})));
}

function filter2146() {
  return pipe(
    flatMap((value: $.ProtoMessages) => {
      if (value.payloadType === 2146) {
        return of(value);
      }
      return EMPTY;
    })
    // filter(value => value.payloadType === 2146),
  );
}

function filter2150() {
  return pipe(
    flatMap((value: $.ProtoMessages) => {
      if (value.payloadType === 2150) {
        return of(value);
      }
      return EMPTY;
    })
    // filter(value => value.payloadType === 2146),
  );
}

function pmFilter(payloadType: $.ProtoOAPayloadType | $.ProtoPayloadType) {
  return filter<$.ProtoMessages>(pm => pm.payloadType === payloadType);
}
function clientMsgId(clientMsgId: string) {
  return filter<$.ProtoMessages>(pm => pm.clientMsgId === clientMsgId);
}

function output(pm: $.ProtoMessages) {
  outputProtoMessages.next(pm);
}

const TICK_DATA_CONFIG = {
  fromTimestamp: new Date("2019-07-24T18:00:00.000Z").getTime(),
  toTimestamp: new Date("2019-07-25T18:00:00.000Z").getTime(),
  symbolId: 1
};
inputProtoMessages.pipe(requestAccounts()).subscribe(output);
inputProtoMessages.pipe(authenticateAccounts()).subscribe(output);
inputProtoMessages.pipe(requestTickData(TICK_DATA_CONFIG)).subscribe(output);

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
