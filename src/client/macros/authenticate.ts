import {
  SpotwareClientSocket,
  ProtoOATrader,
  ProtoOACtidTraderAccount,
} from "@claasahl/spotware-adapter";
import fs from "fs";
import { parse } from "dotenv";

import { macro as authenticateAccount } from "./authenticateAccount";
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
): Promise<ProtoOATrader[]> {
  const {
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
    envFile = ".env",
  } = options;
  await R.PROTO_OA_APPLICATION_AUTH_REQ(socket, { clientId, clientSecret });

  const accounts: ProtoOACtidTraderAccount[] = [];
  try {
    // fetch accounts with "old" access token
    const result = await R.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(socket, {
      accessToken,
    });
    accounts.push(...result.ctidTraderAccount);
  } catch {
    // refresh tokens
    const tokens = await R.PROTO_OA_REFRESH_TOKEN_REQ(socket, { refreshToken });
    const env: any = {};
    const data = await fs.promises.readFile(envFile);
    Object.assign(env, parse(data));
    Object.assign(env, tokens);
    await fs.promises.copyFile(envFile, `${envFile}_${Date.now()}`);
    await fs.promises.writeFile(envFile, dotenv(env));

    // fetch accounts with "new" access token
    const result = await R.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(socket, {
      accessToken,
    });
    accounts.push(...result.ctidTraderAccount);
  }

  return Promise.all(
    accounts.map(({ ctidTraderAccountId }) => {
      return authenticateAccount(socket, { accessToken, ctidTraderAccountId });
    })
  );
}
