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
      message.payloadType === ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        socket.write(
          FACTORY.PROTO_OA_ASSET_CLASS_LIST_RES(
            { ctidTraderAccountId, assetClass: entry.assetClasses },
            clientMsgId
          )
        );
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E3" }, clientMsgId)
        );
      }
    }
  };
}
