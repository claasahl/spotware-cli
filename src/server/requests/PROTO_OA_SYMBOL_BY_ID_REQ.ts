import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_SYMBOL_BY_ID_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      }
      const symbolIds = message.payload.symbolId;
      const symbols = entry.symbols.filter((s) =>
        symbolIds.includes(s.symbolId)
      );
      if (symbols.length < symbolIds.length) {
        const missing = symbolIds.filter(
          (id) => !symbols.map((s) => s.symbolId).includes(id)
        );
        U.SYMBOL_NOT_FOUND(socket, ctidTraderAccountId, missing, clientMsgId);
        return;
      }

      response(
        socket,
        { ctidTraderAccountId, archivedSymbol: [], symbol: symbols },
        clientMsgId
      );
    }
  };
}
