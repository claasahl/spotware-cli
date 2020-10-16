import { ProtoOATrader } from "@claasahl/spotware-adapter";

import { macro as authenticateAccount } from "./authenticateAccount";
import * as R from "../requests";
import { CustomSpotwareSocket } from "../CustomSpotwareSocket";

export interface Options {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

export async function macro(
  socket: CustomSpotwareSocket,
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
