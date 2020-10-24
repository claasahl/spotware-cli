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
      message.payloadType === ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        const alreadyUnsubscribed = symbolIds
          .map((id) => !entry.subscriptions[id])
          .find((p) => p);
        if (alreadyUnsubscribed) {
          socket.write(
            FACTORY.PROTO_OA_ERROR_RES(
              { errorCode: "E7 - no subscription" },
              clientMsgId
            )
          );
          return;
        }
        socket.write(
          FACTORY.PROTO_OA_UNSUBSCRIBE_SPOTS_RES(
            { ctidTraderAccountId },
            clientMsgId
          )
        );

        for (const symbolId of symbolIds) {
          clearInterval(entry.subscriptions[symbolId]);
          delete entry.subscriptions[symbolId];
        }
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E7" }, clientMsgId)
        );
      }
    }
  };
}
