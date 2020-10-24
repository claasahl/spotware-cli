import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_UNSUBSCRIBE_SPOTS_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        error(socket, { errorCode: "E7" }, clientMsgId);
        return;
      }

      const alreadyUnsubscribed = symbolIds
        .map((id) => !entry.subscriptions[id])
        .find((p) => p);
      if (alreadyUnsubscribed) {
        error(socket, { errorCode: "E7 - no subscription" }, clientMsgId);
        return;
      }
      response(socket, { ctidTraderAccountId }, clientMsgId);

      for (const symbolId of symbolIds) {
        clearInterval(entry.subscriptions[symbolId]);
        delete entry.subscriptions[symbolId];
      }
    }
  };
}
