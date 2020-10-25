import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType ===
      ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ
    ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId, period } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      }
      if (!entry.hasSubscription(socket, symbolId)) {
        U.NO_SUBSCRIPTION(socket, ctidTraderAccountId, symbolId, clientMsgId);
        return;
      }
      if (entry.hasTrendbarSubscription(socket, symbolId, period)) {
        U.ALREADY_SUBSCRIBED(
          socket,
          ctidTraderAccountId,
          symbolId,
          clientMsgId
        );
        return;
      }

      response(socket, { ctidTraderAccountId }, clientMsgId);
      entry.subscribeTrendbars(socket, symbolId, period);
    }
  };
}
