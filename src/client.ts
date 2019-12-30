import debug from "debug";

import config from "./config";
import { SpotwareOnline } from "./spotwareOnline";
import { concat, merge } from "rxjs";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

function main() {
  const log = debug("client");
  const { port, host, clientId, clientSecret, accessToken } = config;
  const a = new SpotwareOnline({
    auth: { accessToken, clientId, clientSecret },
    conn: { host, port },
    symbol: "BTC/EUR"
  });

  concat(
    a.spots(
      new Date("2019-12-29T00:00:00.000Z"),
      new Date("2019-12-30T00:00:00.000Z")
    ),
    a.trendbars(
      ProtoOATrendbarPeriod.H1,
      new Date("2019-12-29T00:00:00.000Z"),
      new Date("2019-12-30T00:00:00.000Z")
    ),
    merge(a.spots(), a.trendbars(ProtoOATrendbarPeriod.M1))
  ).subscribe(
    spotOrTrendbar => log("%j", spotOrTrendbar),
    err => log("error: %j", err),
    main
  );
}
main();
