import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";
import { STORE } from "../store";

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ
    ) {
      const {
        clientMsgId,
        payload: { ctidTraderAccountId },
      } = message;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        socket.write(
          FACTORY.PROTO_OA_SYMBOL_CATEGORY_RES(
            { ctidTraderAccountId, symbolCategory: entry.categories },
            clientMsgId
          )
        );
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E4" }, clientMsgId)
        );
      }
    }
  };
}
