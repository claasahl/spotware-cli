import {
  fromEvent,
  Subject,
  pipe,
  of,
  EMPTY,
  interval,
  asyncScheduler,
  Observer,
  concat,
  merge
} from "rxjs";
import {
  tap,
  share,
  first,
  flatMap,
  map,
  publishReplay,
  observeOn,
  filter,
  scan,
  toArray,
  min,
  multicast
} from "rxjs/operators";
import * as $ from "@claasahl/spotware-adapter";

import CONFIG from "./config";
import UTIL from "./util";
import { ProtoMessages } from "@claasahl/spotware-adapter";

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
  .pipe(tap(message => $.write(socket, message)))
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

function requestTickData(
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId">
  >
) {
  return pipe(
    multicast(new Subject<ProtoMessages>(), shared => {
      const start = shared.pipe(
        pmFilter(PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES),
        filter2150(), // TODO find another way to "cast" values/events
        first(),
        flatMap(message => of(...message.payload.ctidTraderAccount)),
        map(({ ctidTraderAccountId }) =>
          UTIL.pm2145({ ...config, ctidTraderAccountId })
        )
      );
      const rest = shared.pipe(
        pmFilter(PROTO_OA_GET_TICKDATA_RES),
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
            map(pm =>
              UTIL.pm2145({
                ...config,
                ctidTraderAccountId,
                toTimestamp: pm.timestamp
              })
            )
          );
        })
      );
      return merge(start, rest);
    })
  );
}
function fetchTickData(
  config: Pick<
    $.ProtoOAGetTickDataReq,
    Exclude<keyof $.ProtoOAGetTickDataReq, "ctidTraderAccountId">
  >
) {
  return pipe(
    pmFilter(PROTO_OA_GET_TICKDATA_RES),
    filter2146(), // TODO find another way to "cast" values/events
    flatMap(pm => {
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
        flatMap(value => of(...value))
      );
    }),
    map(tick => ({
      ...tick,
      date: new Date(tick.timestamp),
      type: config.type
    }))
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

function output(pm: $.ProtoMessages) {
  outputProtoMessages.next(pm);
}

const TICK_DATA_CONFIG = {
  fromTimestamp: new Date("2019-07-24T18:00:00.000Z").getTime(),
  toTimestamp: new Date("2019-07-25T18:00:00.000Z").getTime(),
  symbolId: 1,
  type: $.ProtoOAQuoteType.ASK
};
inputProtoMessages.pipe(requestAccounts()).subscribe(output);
inputProtoMessages.pipe(authenticateAccounts()).subscribe(output);
inputProtoMessages.pipe(requestTickData(TICK_DATA_CONFIG)).subscribe(output);
inputProtoMessages.pipe(fetchTickData(TICK_DATA_CONFIG)).subscribe(tick => {
  console.log(JSON.stringify(tick));
});

authenticateApplication().subscribe(output);
heartbeats().subscribe(output);
