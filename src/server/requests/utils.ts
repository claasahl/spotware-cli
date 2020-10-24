import { Messages, SpotwareSocket } from "@claasahl/spotware-adapter";

export function response<T extends Messages["payload"]>(
  factory: (payload: T, clientMsgId?: string) => Messages
) {
  return (socket: SpotwareSocket, payload: T, clientMsgId?: string) => {
    socket.write(factory(payload, clientMsgId));
  };
}
