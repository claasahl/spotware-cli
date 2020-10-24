import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_ACCOUNT_AUTH_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, accessToken } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry && entry.accessTokens.includes(accessToken)) {
        response(socket, { ctidTraderAccountId }, clientMsgId);
      } else {
        error(socket, { errorCode: "E1" }, clientMsgId);
      }
    }
  };
}
