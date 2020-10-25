import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  PROTO_OA_APPLICATION_AUTH_RES,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import * as U from "./utils";

const response = U.response<PROTO_OA_APPLICATION_AUTH_RES["payload"]>(
  FACTORY.PROTO_OA_APPLICATION_AUTH_RES
);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ
    ) {
      const { clientMsgId } = message;
      response(socket, {}, clientMsgId);
    }
  };
}
