import { FACTORY, Messages, SpotwareSocket } from "@claasahl/spotware-adapter";
import ms from "ms";

export function response<T extends Messages["payload"]>(
  factory: (payload: T, clientMsgId?: string) => Messages
) {
  return async (
    socket: SpotwareSocket,
    payload: T | Promise<T>,
    clientMsgId?: string
  ) => {
    socket.write(factory(await payload, clientMsgId));
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

export function ALREADY_SUBSCRIBED(
  socket: SpotwareSocket,
  ctidTraderAccountId: number,
  symbolId: number,
  clientMsgId?: string
) {
  socket.write(
    FACTORY.PROTO_OA_ERROR_RES(
      {
        errorCode: "INVALID_REQUEST",
        ctidTraderAccountId,
        description: `Already subscribed to symbol ${symbolId}.`,
      },
      clientMsgId
    )
  );
}

export function NO_SUBSCRIPTION(
  socket: SpotwareSocket,
  ctidTraderAccountId: number,
  symbolId: number,
  clientMsgId?: string
) {
  socket.write(
    FACTORY.PROTO_OA_ERROR_RES(
      {
        errorCode: "INVALID_REQUEST",
        ctidTraderAccountId,
        description: `No subscription for symbol ${symbolId}.`,
      },
      clientMsgId
    )
  );
}

export function INCORRECT_BOUNDARIES(
  socket: SpotwareSocket,
  ctidTraderAccountId: number,
  maxPeriod: number,
  clientMsgId?: string
) {
  socket.write(
    FACTORY.PROTO_OA_ERROR_RES(
      {
        errorCode: "INCORRECT_BOUNDARIES",
        ctidTraderAccountId,
        description: `Incorrect period boundaries or requested period is longer than allowed ${maxPeriod} (${ms(
          maxPeriod
        )}).`,
      },
      clientMsgId
    )
  );
}
export const MAX_PERIOD: { [key: string]: number } = {
  H1: 21168000000,
  W1: 158112000000,
  tickData: 604800000,
};
