import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

export function request(socket: SpotwareSocket) {
  return (msg: Messages) => {
    if (msg.payloadType === ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ) {
      socket.write(FACTORY.PROTO_OA_APPLICATION_AUTH_RES({}, msg.clientMsgId));
    }
  };
}
