import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ) {
      const {
        clientMsgId,
        payload: { ctidTraderAccountId, accessToken },
      } = message;
      const entry = STORE[ctidTraderAccountId];
      if (entry && entry.accessTokens.includes(accessToken)) {
        socket.write(
          FACTORY.PROTO_OA_ACCOUNT_AUTH_RES(
            { ctidTraderAccountId },
            clientMsgId
          )
        );
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E1" }, clientMsgId)
        );
      }
    }
  };
}
