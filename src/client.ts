import debug from "debug";
import { concat, merge } from "rxjs";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";
import { tap, toArray, map } from "rxjs/operators";
import fs from "fs";

import config from "./config";
import { SpotwareOnline } from "./spotwareOnline";
import { SpotwareOffline } from "./spotwareOffline";
import { Trader } from "./types";
import TestSubject from "./testSubject";

function createOnlineTrader() {
  const { port, host, clientId, clientSecret, accessToken } = config;
  return new SpotwareOnline({
    auth: { accessToken, clientId, clientSecret },
    conn: { host, port },
    symbol: "BTC/EUR"
  });
}
function createOfflineTrader(file: string) {
  return new SpotwareOffline({ file });
}

function main(create: () => Trader) {
  const log = debug("client");
  const a = create();
  concat(merge(a.spots(), a.trendbars(ProtoOATrendbarPeriod.M1))).subscribe(
    spotOrTrendbar => log("%j", spotOrTrendbar),
    err => log("error: %j", err)
  );
}

const file = "./store/spots-2019-12.json";
const action: string = "update";

if (action === "offline") {
  main(() => createOfflineTrader(file));
} else if (action === "online") {
  main(createOnlineTrader);
} else if (action === "update") {
  const { port, host, clientId, clientSecret, accessToken } = config;
  const online = new TestSubject(
    { accessToken, clientId, clientSecret },
    { host, port }
  );
  concat(
    online.authenticate(),
    online
      .tickData(
        "BTC/EUR",
        new Date("2019-12-01T00:00:00.000Z"),
        new Date("2020-01-01T00:00:00.000Z")
      )
      .pipe(
        map(({ ask, bid, timestamp }) => ({ ask, bid, timestamp })),
        toArray(),
        tap(spots => {
          fs.writeFileSync(file, JSON.stringify(spots));
        })
      )
  ).subscribe();
}
