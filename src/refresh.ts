import debug from "debug";
import { concat } from "rxjs";
import { filter, tap } from "rxjs/operators";
import $ from "@claasahl/spotware-adapter";
import fs from "fs";
import { parse } from "dotenv";

import config from "./config";
import { SpotwareSubject } from "./spotwareSubject";
import { refreshToken } from "./requests/refreshToken";
import { applicationAuth, version } from "./requests";

function dotenv(env: object): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");
}

function main() {
  const log = debug("refresh-access-token");
  log("configuration is %j", config);

  const { port, host, clientId, clientSecret, refreshToken: rToken } = config;

  const subject = new SpotwareSubject(port, host);
  concat(
    version(subject, {}),
    applicationAuth(subject, { clientId, clientSecret }),
    refreshToken(subject, { refreshToken: rToken }).pipe(
      filter(
        (pm): pm is $.ProtoMessage2174 =>
          pm.payloadType === $.ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_RES
      ),
      tap(pm => {
        const env = {};
        Object.assign(env, parse(fs.readFileSync(".env")));
        Object.assign(env, pm.payloadType);
        fs.copyFileSync(".env", `.env_${new Date()}`);
        fs.writeFileSync(".env", dotenv(env));
      })
    )
  ).subscribe();
}
main();
