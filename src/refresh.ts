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

// https://connect.spotware.com/apps/token?grant_type=refresh_token&refresh_token=XJzPUT2KK-j1zru9_wXfmnvmjBxDVy4vhcIMAQdfNbs&client_id=409_64vtBTyifw4CCAYWljsSzdlvMhvAzwfepkFr6HzNiD4EVYbAnG&client_secret=J7KtC05qWRAHHTijvU3SyCBjpi8iYYCOBx8s6BuQ3H0EqQq5bc

async function main() {
  const log = debug("refresh-access-token");
  log("configuration is %j", config);

  const client = new SpotwareClient(config);
  log("%j", await client.version({}))
  await client.applicationAuth(config);
  const msg = await client.refreshToken(config);
  const env = {};
  Object.assign(env, parse(fs.readFileSync(".env")));
  Object.assign(env, msg);
  fs.copyFileSync(".env", `.env_${new Date()}`);
  fs.writeFileSync(".env", dotenv(env));
  client.end();
}
main();
