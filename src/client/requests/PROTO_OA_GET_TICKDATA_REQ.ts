import {
  SpotwareClientSocket,
  FACTORY,
  Messages,
  ProtoPayloadType,
  ProtoOAPayloadType,
  PROTO_OA_GET_TICKDATA_REQ,
  PROTO_OA_GET_TICKDATA_RES,
} from "@claasahl/spotware-adapter";
import { v4 as uuid } from "uuid";

import { error } from "./utils";

export default function request(
  socket: SpotwareClientSocket,
  request: PROTO_OA_GET_TICKDATA_REQ["payload"],
  cb: (
    // this does not work for all requests. the result for some requests might change over time (i.e. auth account... account can get "kicked" out)
    error: Error | undefined | null,
    response: PROTO_OA_GET_TICKDATA_RES["payload"] | undefined | null,
    request: PROTO_OA_GET_TICKDATA_REQ["payload"]
  ) => void
) {
  const clientMsgId = uuid();
  socket.write(FACTORY.PROTO_OA_GET_TICKDATA_REQ(request, clientMsgId));
  const listener = (message: Messages) => {
    if (message.clientMsgId !== clientMsgId) {
      return;
    }
    socket.off("data", listener);
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES:
        cb(null, message.payload, request);
        break;
      case ProtoPayloadType.ERROR_RES:
        cb(error(message.payload), null, request);
        break;
      case ProtoOAPayloadType.PROTO_OA_ERROR_RES:
        cb(error(message.payload), null, request);
        break;
      default:
        cb(new Error(), null, request);
        break;
    }
  };
  socket.on("data", listener);
}
