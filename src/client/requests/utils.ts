import {
  SpotwareClientSocket,
  FACTORY,
  Messages,
  ProtoPayloadType,
  ProtoOAPayloadType,
  PROTO_OA_ERROR_RES,
  ERROR_RES,
} from "@claasahl/spotware-adapter";
import { v4 as uuid } from "uuid";

export function error(
  message: PROTO_OA_ERROR_RES["payload"] | ERROR_RES["payload"]
): Error {
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

export type BEHEST<REQ extends Messages, RES extends Messages> = (
  socket: SpotwareClientSocket,
  request: REQ["payload"],
  cb: (
    error: Error | undefined | null,
    response: RES["payload"] | undefined | null,
    request: REQ["payload"]
  ) => void
) => void;

export function behest<REQ extends Messages, RES extends Messages>(
  builder: (payload: REQ["payload"], clientMsgId?: string) => REQ,
  _requestType: REQ["payloadType"],
  responseType: RES["payloadType"]
): BEHEST<REQ, RES> {
  return (socket, request, cb) => {
    const clientMsgId = uuid();
    socket.write(builder(request, clientMsgId));
    const listener = (message: Messages) => {
      if (message.clientMsgId !== clientMsgId) {
        return;
      }
      socket.off("data", listener);
      switch (message.payloadType) {
        case responseType:
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
  };
}
