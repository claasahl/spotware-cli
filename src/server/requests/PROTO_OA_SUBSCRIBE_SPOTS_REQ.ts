import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_SUBSCRIBE_SPOTS_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      }

      const alreadySubscribed = symbolIds
        .map((id) => !!entry.subscriptions[id])
        .find((p) => p);
      if (alreadySubscribed) {
        error(
          socket,
          { errorCode: "E6 - only one subscription per symbol allowed" },
          clientMsgId
        );
        return;
      }
      response(socket, { ctidTraderAccountId }, clientMsgId);

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
    }
  };
}
