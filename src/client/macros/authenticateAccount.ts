import { ProtoOATrader } from "@claasahl/spotware-adapter";

import * as R from "../requests";
import { CustomSpotwareSocket } from "../CustomSpotwareSocket";

export interface Options {
  accessToken: string;
  ctidTraderAccountId: number;
}

export async function macro(
  socket: CustomSpotwareSocket,
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
