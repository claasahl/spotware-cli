import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  ProtoOAQuoteType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { maxQuotePeriod } from "../../utils";
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
        type,
      } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      const boundary = maxQuotePeriod(type);
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      } else if (
        Math.abs(toTimestamp - fromTimestamp) > boundary ||
        Math.abs(toTimestamp - fromTimestamp) === 0
      ) {
        U.INCORRECT_BOUNDARIES(
          socket,
          ctidTraderAccountId,
          boundary,
          clientMsgId
        );
        return;
      }

      response(socket, entry.ticks(message.payload), clientMsgId);
    }
  };
}
