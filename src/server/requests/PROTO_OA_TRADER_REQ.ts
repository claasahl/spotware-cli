import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_TRADER_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_TRADER_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        response(
          socket,
          { ctidTraderAccountId, trader: entry.trader },
          clientMsgId
        );
      } else {
        error(socket, { errorCode: "E2" }, clientMsgId);
      }
    }
  };
}
