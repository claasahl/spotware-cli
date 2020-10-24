import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_SYMBOLS_LIST_RES);
const error = U.response(FACTORY.PROTO_OA_ERROR_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (entry) {
        response(
          socket,
          { ctidTraderAccountId, archivedSymbol: [], symbol: entry.symbols },
          clientMsgId
        );
      } else {
        error(socket, { errorCode: "E5" }, clientMsgId);
      }
    }
  };
}
