import { Messages, SpotwareSocket } from "@claasahl/spotware-adapter";
import { request as PROTO_OA_APPLICATION_AUTH_REQ } from "./PROTO_OA_APPLICATION_AUTH_REQ";

export function requests(socket: SpotwareSocket) {
  const requests = [PROTO_OA_APPLICATION_AUTH_REQ(socket)];
  return (msg: Messages) => {
    requests.forEach((req) => req(msg));
  };
}
