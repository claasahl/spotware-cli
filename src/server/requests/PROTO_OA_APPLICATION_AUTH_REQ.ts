import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (
      message.payloadType === ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ
    ) {
      const { clientMsgId } = message;
      socket.write(FACTORY.PROTO_OA_APPLICATION_AUTH_RES({}, clientMsgId));
    }
  };
}
