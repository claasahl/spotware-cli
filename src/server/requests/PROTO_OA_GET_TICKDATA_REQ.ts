import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_GET_TICKDATA_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        response(
          socket,
          { ctidTraderAccountId, hasMore: false, tickData: [] },
          clientMsgId
        );
      } else {
        error(socket, { errorCode: "E8" }, clientMsgId);
      }
    }
  };
}
