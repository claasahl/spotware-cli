import { SpotwareClientSocket } from "@claasahl/spotware-adapter";
import fs from "fs";
import { parse } from "dotenv";

import * as R from "../requests";

function dotenv(env: object): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export interface Options {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  envFile?: string;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<Omit<Options, "envFile">> {
  const { refreshToken, envFile = ".env" } = options;
  const result = await R.PROTO_OA_REFRESH_TOKEN_REQ(socket, { refreshToken });

  const env: any = {};
  const data = await fs.promises.readFile(envFile);
  Object.assign(env, parse(data));
  Object.assign(env, result);
  await fs.promises.copyFile(envFile, `${envFile}_${Date.now()}`);
  await fs.promises.writeFile(envFile, dotenv(env));
  return {
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    accessToken: env.accessToken,
    refreshToken: env.refreshToken,
  };
}
