import {
  SpotwareClientSocket,
  FACTORY,
  Messages,
  ProtoPayloadType,
  ProtoOAPayloadType,
  ProtoOAVersionReq,
  ProtoOAVersionRes,
} from "@claasahl/spotware-adapter";
import { v4 as uuid } from "uuid";

import { error } from "./utils";

// version

// auth app
// lookup accounts by access token (refresh token if needed)
// initial account.ts for each account

export default function request(
  socket: SpotwareClientSocket,
  cb: (
    // this does not work for all requests. the result for some requests might change over time (i.e. auth account... account can get "kicked" out)
    error: Error | undefined | null,
    response: ProtoOAVersionRes | undefined | null,
    request: ProtoOAVersionReq
  ) => void
) {
  const clientMsgId = uuid();
  const request: ProtoOAVersionReq = {};
  socket.write(FACTORY.PROTO_OA_VERSION_REQ(request, clientMsgId));
  const listener = (message: Messages) => {
    if (message.clientMsgId !== clientMsgId) {
      return;
    }
    socket.off("data", listener);
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_VERSION_RES:
        cb(null, message.payload, request);
        break;
      case ProtoPayloadType.ERROR_RES:
        cb(error(message.payload), null, request);
        break;
      case ProtoOAPayloadType.PROTO_OA_ERROR_RES:
        cb(error(message.payload), null, request);
        break;
    }
  };
  socket.on("data", listener);
}
