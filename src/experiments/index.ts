import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, Subject, of, EMPTY } from "rxjs";
import {
  share,
  tap,
  map,
  flatMap,
  filter,
  toArray,
  groupBy,
  mergeMap,
  timeoutWith,
  distinctUntilKeyChanged
} from "rxjs/operators";

import CONFIG from "../config";
import { throttle, when, trendbar } from "../operators";
import { pm2137, pm2116 } from "../utils";
import { createDirSync, writeJsonSync, appendJsonSync } from "./files";
import { create, ExperimentConfig } from "./experiment";
import {
  authenticateApplication,
  requestAccounts,
  authenticateAccounts,
  requestSymbols
} from "../routines";

// parameters / configs
const config: ExperimentConfig = {
  ...CONFIG,
  symbolName: "BTC/EUR",
  fromDate: "2019-02-01T00:00:00.000Z",
  toDate: "2019-08-01T00:00:00.000Z",
  label: "getting started",
  dir: `./experiments/`
};

// ----
const experiment = create(config);
const {
  port,
  host,
  clientId,
  clientSecret,
  accessToken,
  symbolName
} = experiment.config;
const intervals = of(...experiment.intervals);
const periods = of(...experiment.periods);

// ----

const socket = $.connect(port, host);
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

// 💥 -> PROTO_OA_APPLICATION_AUTH_REQ
authenticateApplication({ clientId, clientSecret }).subscribe(output);

// PROTO_OA_APPLICATION_AUTH_RES -> PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ
const APPLICATION_AUTH_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES)
);
APPLICATION_AUTH_RES.pipe(requestAccounts({ accessToken })).subscribe(output);

// PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES -> PROTO_OA_ACCOUNT_AUTH_REQ
const GET_ACCOUNTS_BY_ACCESS_TOKEN_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES)
);
GET_ACCOUNTS_BY_ACCESS_TOKEN_RES.pipe(
  authenticateAccounts({ accessToken })
).subscribe(output);

// PROTO_OA_ACCOUNT_AUTH_RES -> PROTO_OA_SYMBOLS_LIST_REQ
const ACCOUNT_AUTH_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES)
);
ACCOUNT_AUTH_RES.pipe(requestSymbols({})).subscribe(output);

// PROTO_OA_SYMBOLS_LIST_RES -> PROTO_OA_SYMBOL_BY_ID_REQ
const SYMBOLS_LIST_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES)
);
SYMBOLS_LIST_RES.pipe(
  groupBy(pm => pm.payload.ctidTraderAccountId),
  mergeMap(symbols =>
    symbols.pipe(
      flatMap(pm => pm.payload.symbol),
      filter(symbol => symbol.symbolName === symbolName),
      map(({ symbolId }) => ({ symbolId, ctidTraderAccountId: symbols.key }))
    )
  ),
  map(({ ctidTraderAccountId, symbolId }) =>
    pm2116({ ctidTraderAccountId, symbolId: [symbolId] })
  )
).subscribe(output);

// PROTO_OA_SYMBOL_BY_ID_RES -> PROTO_OA_GET_TRENDBARS_REQ
const SYMBOL_BY_ID_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_RES)
);
SYMBOL_BY_ID_RES.pipe(
  groupBy(pm => pm.payload.ctidTraderAccountId),
  mergeMap(symbols =>
    symbols.pipe(
      flatMap(pm => pm.payload.symbol),
      map(({ symbolId }) => ({ symbolId, ctidTraderAccountId: symbols.key }))
    )
  ),
  flatMap(value => periods.pipe(map(period => ({ ...value, period })))),
  flatMap(value =>
    intervals.pipe(
      map(({ fromTimestamp, toTimestamp }) => ({
        ...value,
        fromTimestamp,
        toTimestamp
      }))
    )
  ),
  map(value => pm2137(value))
).subscribe(output);

// PROTO_OA_GET_TRENDBARS_RES ->
const GET_TRENDBARS_RES = incomingProtoMessages.pipe(
  when($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES)
);

// -----
createDirSync(experiment);
writeJsonSync(experiment, "experiment.json", experiment);
ACCOUNT_AUTH_RES.pipe(
  map(pm => pm.payload.ctidTraderAccountId),
  timeoutWith(5000, EMPTY),
  toArray()
).subscribe(ids => writeJsonSync(experiment, "ctidTraderAccountIds.json", ids));
SYMBOL_BY_ID_RES.pipe(
  timeoutWith(5000, EMPTY),
  toArray()
).subscribe(symbols => writeJsonSync(experiment, "symbols.json", symbols));
GET_TRENDBARS_RES.pipe(
  timeoutWith(5000, EMPTY),
  groupBy(
    ({ payload: { ctidTraderAccountId, period } }) =>
      `trendbars-${ctidTraderAccountId}-${$.ProtoOATrendbarPeriod[period]}.json`
  ),
  mergeMap(trendbars =>
    trendbars.pipe(
      flatMap(pm =>
        of(...pm.payload.trendbar).pipe(trendbar(pm.payload.period))
      ),
      distinctUntilKeyChanged("timestamp"),
      toArray(),
      tap(data => writeJsonSync(experiment, trendbars.key, data))
    )
  )
).subscribe();
