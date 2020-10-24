import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

export function request(socket: SpotwareSocket) {
  return (msg: Messages) => {
    if (msg.payloadType === ProtoOAPayloadType.PROTO_OA_VERSION_REQ) {
      socket.write(
        FACTORY.PROTO_OA_VERSION_RES({ version: "00" }, msg.clientMsgId)
      );
    }
  };
}
