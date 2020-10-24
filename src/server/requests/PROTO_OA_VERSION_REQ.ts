import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_VERSION_REQ) {
      socket.write(
        FACTORY.PROTO_OA_VERSION_RES({ version: "00" }, message.clientMsgId)
      );
    }
  };
}
