import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";
import { STORE } from "../store";

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ) {
      const {
        clientMsgId,
        payload: { ctidTraderAccountId },
      } = message;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        socket.write(
          FACTORY.PROTO_OA_SYMBOLS_LIST_RES(
            {
              ctidTraderAccountId,
              archivedSymbol: [],
              symbol: entry.symbols,
            },
            clientMsgId
          )
        );
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E5" }, clientMsgId)
        );
      }
    }
  };
}
