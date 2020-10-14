import {
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "../requests";

export interface Options {
  accessToken: string;
  ctidTraderAccountId: number;
}

export async function macro(
  socket: SpotwareClientSocket,
  options: Options
): Promise<ProtoOATrader> {
  const { accessToken, ctidTraderAccountId } = options;
  await R.PROTO_OA_ACCOUNT_AUTH_REQ(socket, {
    accessToken,
    ctidTraderAccountId,
  });
  const { trader } = await R.PROTO_OA_TRADER_REQ(socket, {
    ctidTraderAccountId,
  });
  return trader;
}
