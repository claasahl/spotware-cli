import {
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import { macro as authenticateAccount } from "./authenticateAccount";
import * as R from "../requests";

export interface Options {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<ProtoOATrader[]> {
  const { clientId, clientSecret, accessToken } = options;
  await R.PROTO_OA_APPLICATION_AUTH_REQ(socket, { clientId, clientSecret });
  const accounts = await R.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(socket, {
    accessToken,
  });
  return Promise.all(
    accounts.ctidTraderAccount.map(({ ctidTraderAccountId }) => {
      return authenticateAccount(socket, { accessToken, ctidTraderAccountId });
    })
  );
}
