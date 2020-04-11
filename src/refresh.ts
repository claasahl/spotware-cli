import debug from "debug";
import fs from "fs";
import { parse } from "dotenv";

import config from "./config";
import { SpotwareClient } from "./services/spotware/client";

function dotenv(env: object): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");
}

function main() {
  const log = debug("refresh-access-token");
  log("configuration is %j", config);

  const client = new SpotwareClient(config);
  client.version({}, msg => log("%j", msg))
  client.applicationAuth(config, () => {
    client.refreshToken(config, msg => {
      const env = {};
      Object.assign(env, parse(fs.readFileSync(".env")));
      Object.assign(env, msg);
      fs.copyFileSync(".env", `.env_${new Date()}`);
      fs.writeFileSync(".env", dotenv(env));
      client.end();
    })
  });
}
main();
