import {
  SpotwareClientSocket,
  FACTORY,
  Messages,
  ProtoPayloadType,
  ProtoOAPayloadType,
  ProtoOAVersionReq,
  ProtoOAVersionRes,
  ProtoErrorRes,
  ProtoOAErrorRes,
} from "@claasahl/spotware-adapter";
import { v4 as uuid } from "uuid";

// version

// auth app
// lookup accounts by access token (refresh token if needed)
// initial account.ts for each account

function toError(message: ProtoErrorRes | ProtoOAErrorRes): Error {
  const parts: string[] = [];
  if (message.description) {
    parts.push(`${message.errorCode}: ${message.description}`);
  } else {
    parts.push(message.errorCode);
  }
  if (message.maintenanceEndTimestamp) {
    const date = new Date(message.maintenanceEndTimestamp);
    parts.push(`(end of maintenance: ${date.toISOString()})`);
  }
  if ("ctidTraderAccountId" in message && message.ctidTraderAccountId) {
    parts.push(`(account: ${message.ctidTraderAccountId})`);
  }
  return new Error(parts.join(" "));
}

function version(
  socket: SpotwareClientSocket,
  cb: (
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
        cb(toError(message.payload), null, request);
        break;
      case ProtoOAPayloadType.PROTO_OA_ERROR_RES:
        cb(toError(message.payload), null, request);
        break;
    }
  };
  socket.on("data", listener);
}
