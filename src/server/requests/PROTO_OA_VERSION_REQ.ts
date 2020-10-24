import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_VERSION_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_VERSION_REQ) {
      const { clientMsgId } = message;
      response(socket, { version: "00" }, clientMsgId);
    }
  };
}
