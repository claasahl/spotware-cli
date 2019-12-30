import debug from "debug";

import config from "./config";
import { SpotwareOnline } from "./spotwareOnline";
import { concat } from "rxjs";

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
    a.spots()
  ).subscribe(
    spot => log("%j", spot),
    err => log("error: %j", err),
    main
  );
}
main();
