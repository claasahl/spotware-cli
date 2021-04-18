import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_GET_TICKDATA_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ) {
      const { clientMsgId } = message;
      const {
        ctidTraderAccountId,
        fromTimestamp,
        toTimestamp,
      } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      } else if (
        Math.abs(toTimestamp - fromTimestamp) > U.MAX_PERIOD.tickData
      ) {
        U.INCORRECT_BOUNDARIES(
          socket,
          ctidTraderAccountId,
          U.MAX_PERIOD.tickData,
          clientMsgId
        );
        return;
      }

      response(socket, entry.ticks(message.payload), clientMsgId);
    }
  };
}
