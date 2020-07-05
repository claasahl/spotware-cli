import debug from "debug";
import fs from "fs";
import { parse } from "dotenv";

import config from "../config";
import { SpotwareClient } from "../services/spotware/client";

function dotenv(env: object): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");
}

export default async function main() {
  const log = debug("refresh-access-token");
  log("configuration is %j", config);

  const client = new SpotwareClient(config);
  log("%j", await client.version({}))
  await client.applicationAuth(config);
  const msg = await client.refreshToken(config);
  const env = {};
  Object.assign(env, parse(fs.readFileSync(".env")));
  Object.assign(env, msg);
  fs.copyFileSync(".env", `.env_${Date.now()}`);
  fs.writeFileSync(".env", dotenv(env));
  client.end();
}
