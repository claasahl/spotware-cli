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
      message.payloadType === ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ
    ) {
      const {
        clientMsgId,
        payload: { ctidTraderAccountId, symbolId: symbolIds },
      } = message;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        const alreadySubscribed = symbolIds
          .map((id) => !!entry.subscriptions[id])
          .find((p) => p);
        if (alreadySubscribed) {
          socket.write(
            FACTORY.PROTO_OA_ERROR_RES(
              {
                errorCode: "E6 - only one subscription per symbol allowed",
              },
              clientMsgId
            )
          );
          return;
        }
        socket.write(
          FACTORY.PROTO_OA_SUBSCRIBE_SPOTS_RES(
            { ctidTraderAccountId },
            clientMsgId
          )
        );

        for (const symbolId of symbolIds) {
          const timer = setInterval(() => {
            socket.write(
              FACTORY.PROTO_OA_SPOT_EVENT(
                { ctidTraderAccountId, symbolId, trendbar: [] },
                clientMsgId
              )
            );
          }, 1000);
          entry.subscriptions[symbolId] = timer;
        }
      } else {
        socket.write(
          FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E6" }, clientMsgId)
        );
      }
    }
  };
}
