import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_UNSUBSCRIBE_SPOTS_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      }
      for (const symbolId of symbolIds) {
        if (!entry.hasSubscription(socket, symbolId)) {
          U.NO_SUBSCRIPTION(socket, ctidTraderAccountId, symbolId, clientMsgId);
          return;
        }
      }

      response(socket, { ctidTraderAccountId }, clientMsgId);
      for (const symbolId of symbolIds) {
        entry.unsubscribe(socket, symbolId);
      }
    }
  };
}
