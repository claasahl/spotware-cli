import {
  SpotwareClientSocket,
  ProtoOAPayloadType,
} from "@claasahl/spotware-adapter";

export async function macro(socket: SpotwareClientSocket): Promise<void> {
  socket.on("data", (msg) => {
    if (
      msg.payloadType === ProtoOAPayloadType.PROTO_OA_ACCOUNT_DISCONNECT_EVENT
    ) {
      process.exit(1);
    } else if (
      msg.payloadType === ProtoOAPayloadType.PROTO_OA_CLIENT_DISCONNECT_EVENT
    ) {
      process.exit(2);
    }
  });
}
