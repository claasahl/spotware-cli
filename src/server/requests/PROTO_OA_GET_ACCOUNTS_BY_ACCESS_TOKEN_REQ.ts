import {
  FACTORY,
  Messages,
  ProtoOACtidTraderAccount,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType ===
      ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ
    ) {
      const { clientMsgId } = message;
      const { accessToken } = message.payload;
      const ctidTraderAccount: ProtoOACtidTraderAccount[] = [];
      for (const key in STORE) {
        const entry = STORE[key];
        if (entry.accessTokens.length === 0) {
          entry.accessTokens.push(accessToken);
          ctidTraderAccount.push(entry.account);
        } else if (entry.accessTokens.includes(accessToken)) {
          ctidTraderAccount.push(entry.account);
        }
      }
      response(socket, { accessToken, ctidTraderAccount }, clientMsgId);
    }
  };
}
