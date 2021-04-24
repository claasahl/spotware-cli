import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_GET_TRENDBARS_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ) {
      const { clientMsgId } = message;
      const {
        ctidTraderAccountId,
        fromTimestamp,
        toTimestamp,
        period,
      } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      const boundary = U.MAX_PERIOD[ProtoOATrendbarPeriod[period]];
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

      response(socket, entry.trendbars(message.payload), clientMsgId);
    }
  };
}
