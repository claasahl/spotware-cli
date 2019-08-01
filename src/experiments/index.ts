import * as $ from "@claasahl/spotware-adapter";
import { fromEvent, Subject, of } from "rxjs";
import { share, tap, map, shareReplay, flatMap, filter } from "rxjs/operators";
import fs from "fs";
import path from "path";
import uuid from "uuid/v1";

import CONFIG from "../config";
import * as routines from "../routines";
import { throttle, when } from "../operators";
import util from "../util";

// parameters / configs
const config = {
  ...CONFIG,
  symbolName: "EURSEK",
  fromDate: "2019-07-01T00:00:00.000Z",
  toDate: "2019-08-01T00:00:00.000Z",
  label: "getting started",
  dir: `./experiments/`
};

const fromTimestamp = new Date(config.fromDate).getTime();
const toTimestamp = new Date(config.toDate).getTime();
const experimentDir = path.resolve(
  path.join(config.dir, `${uuid()}-${config.label}`)
);

// ----
fs.mkdirSync(experimentDir);
fs.writeFileSync(
  path.join(experimentDir, "config.json"),
  JSON.stringify(config, null, 2)
);

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
    tap(msg => console.log(JSON.stringify(msg)))
  )
  .subscribe();

const outgoingProtoMessages = new Subject<$.ProtoMessages>();
outgoingProtoMessages
  .pipe(
    throttle(300),
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
    tap(ctidTraderAccountId =>
      fs.mkdirSync(path.join(experimentDir, `${ctidTraderAccountId}`))
    )
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
symbols
  .pipe(
    flatMap(({ ctidTraderAccountId, symbolId }) =>
      periods.pipe(
        map(period =>
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
    tap(pm =>
      fs.writeFileSync(
        path.join(
          experimentDir,
          `${pm.payload.ctidTraderAccountId}`,
          `trendbars-${$.ProtoOATrendbarPeriod[pm.payload.period]}.json`
        ),
        JSON.stringify(pm, null, 2)
      )
    )
  )
  .subscribe();
