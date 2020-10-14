import {
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

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
    accounts.ctidTraderAccount.map(async ({ ctidTraderAccountId }) => {
      await R.PROTO_OA_ACCOUNT_AUTH_REQ(socket, {
        accessToken,
        ctidTraderAccountId,
      });
      const { trader } = await R.PROTO_OA_TRADER_REQ(socket, {
        ctidTraderAccountId,
      });
      return trader;
    })
  );
}
