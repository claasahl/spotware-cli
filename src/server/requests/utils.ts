import { FACTORY, Messages, SpotwareSocket } from "@claasahl/spotware-adapter";

export function response<T extends Messages["payload"]>(
  factory: (payload: T, clientMsgId?: string) => Messages
) {
  return (socket: SpotwareSocket, payload: T, clientMsgId?: string) => {
    socket.write(factory(payload, clientMsgId));
  };
}

export function NOT_AUTHORIZED(
  socket: SpotwareSocket,
  ctidTraderAccountId: number,
  clientMsgId?: string
) {
  socket.write(
    FACTORY.PROTO_OA_ERROR_RES(
      {
        errorCode: "INVALID_REQUEST",
        ctidTraderAccountId,
        description: "Trading account is not authorized",
      },
      clientMsgId
    )
  );
}
