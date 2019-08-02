import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, Subject, of, EMPTY } from "rxjs";
import {
  share,
  tap,
  map,
  shareReplay,
  flatMap,
  filter,
  toArray,
  groupBy,
  mergeMap,
  timeoutWith,
  distinctUntilKeyChanged
} from "rxjs/operators";

import CONFIG from "../config";
import * as routines from "../routines";
import { throttle, when, trendbar } from "../operators";
import util from "../util";
import { createDirSync, writeJsonSync, appendJsonSync } from "./files";
import { create, ExperimentConfig } from "./experiment";

// parameters / configs
const config: ExperimentConfig = {
  ...CONFIG,
  symbolName: "EURSEK",
  fromDate: "2019-07-01T00:00:00.000Z",
  toDate: "2019-08-01T00:00:00.000Z",
  label: "getting started",
  dir: `./experiments/`
};

// ----
const experiment = create(config);
createDirSync(experiment);
writeJsonSync(experiment, "experiment.json", experiment);

// ----

const socket = $.connect(config.port, config.host);
const incomingProtoMessages = fromEvent<$.ProtoMessages>(
  socket,
  "PROTO_MESSAGE.*"
).pipe(share());
incomingProtoMessages
  .pipe(
    map(pm => {
      const date = new Date();
      return { timestamp: date.getTime(), date, msg: pm };
    }),
    tap(msg => appendJsonSync(experiment, "proto-messages.json", msg))
  )
  .subscribe();

const outgoingProtoMessages = new Subject<$.ProtoMessages>();
outgoingProtoMessages
  .pipe(
    throttle(500),
    tap(pm => $.write(socket, pm))
  )
  .subscribe();

function output(pm: $.ProtoMessages): void {
  return outgoingProtoMessages.next(pm);
}

routines
  .authenticateApplication({
    clientId: config.clientId,
    clientSecret: config.clientSecret
  })
  .subscribe(output);

const APPLICATION_AUTH_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES)
);
APPLICATION_AUTH_RES.pipe(
  routines.requestAccounts({ accessToken: config.accessToken })
).subscribe(output);

const GET_ACCOUNTS_BY_ACCESS_TOKEN_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES)
);
GET_ACCOUNTS_BY_ACCESS_TOKEN_RES.pipe(
  flatMap(pm => pm.payload.ctidTraderAccount),
  map(({ ctidTraderAccountId }) => ctidTraderAccountId),
  map(ctidTraderAccountId =>
    util.accountAuth({ accessToken: config.accessToken, ctidTraderAccountId })
  )
).subscribe(output);

const ctidTraderAccountIds = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES),
  map(pm => pm.payload.ctidTraderAccountId),
  shareReplay()
);

ctidTraderAccountIds
  .pipe(
    timeoutWith(5000, EMPTY),
    toArray(),
    tap(ids => writeJsonSync(experiment, "ctidTraderAccountIds.json", ids))
  )
  .subscribe();
ctidTraderAccountIds
  .pipe(map(ctidTraderAccountId => util.symbolsList({ ctidTraderAccountId })))
  .subscribe(output);

const symbols = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES),
  flatMap(pm =>
    of(...pm.payload.symbol).pipe(
      map(symbol => ({
        ...symbol,
        ctidTraderAccountId: pm.payload.ctidTraderAccountId
      }))
    )
  ),
  filter(symbol => symbol.symbolName === config.symbolName),
  shareReplay()
);
symbols
  .pipe(
    timeoutWith(5000, EMPTY),
    toArray(),
    tap(symbols => writeJsonSync(experiment, "symbols.json", symbols))
  )
  .subscribe();

const periods = of(
  $.ProtoOATrendbarPeriod.M1,
  $.ProtoOATrendbarPeriod.M2,
  $.ProtoOATrendbarPeriod.M3,
  $.ProtoOATrendbarPeriod.M4,
  $.ProtoOATrendbarPeriod.M5,
  $.ProtoOATrendbarPeriod.M10,
  $.ProtoOATrendbarPeriod.M15,
  $.ProtoOATrendbarPeriod.M30,
  $.ProtoOATrendbarPeriod.H1,
  $.ProtoOATrendbarPeriod.H4,
  $.ProtoOATrendbarPeriod.H12,
  $.ProtoOATrendbarPeriod.D1
);
const intervals = periods.pipe(
  flatMap(period =>
    of(...experiment.intervals).pipe(map(interval => ({ ...interval, period })))
  )
);
symbols
  .pipe(
    flatMap(({ ctidTraderAccountId, symbolId }) =>
      intervals.pipe(
        map(({ fromTimestamp, toTimestamp, period }) =>
          util.getTrendbars({
            ctidTraderAccountId,
            symbolId,
            fromTimestamp,
            toTimestamp,
            period
          })
        )
      )
    )
  )
  .subscribe(output);

incomingProtoMessages
  .pipe(
    when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES),
    timeoutWith(5000, EMPTY),
    groupBy(
      ({ payload: { ctidTraderAccountId, symbolId, period } }) =>
        `trendbars-${ctidTraderAccountId}-${symbolId}-${$.ProtoOATrendbarPeriod[period]}.json`
    ),
    map(trendbars =>
      trendbars.pipe(
        flatMap(pm => pm.payload.trendbar),
        trendbar(),
        distinctUntilKeyChanged("timestamp"),
        toArray(),
        tap(data => writeJsonSync(experiment, trendbars.key, data))
      )
    ),
    mergeMap(value => value)
  )
  .subscribe();
