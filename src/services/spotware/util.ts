import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"

interface SockProps {
  port: number;
  host: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
export function sock(props: SockProps): $.SpotwareSocket {
  const log = debug("spotware");
  const input = log.extend("input");
  const output = log.extend("output");
  const error = log.extend("error");

  const socket = $.connect(props.port, props.host);
  socket.on("connect", () => {
    log("connected")
  })
  socket.on("close", () => {
    log("disconnect")
  })
  socket.on("error", (err: Error) => {
    error(err.message);
  });
  socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    input("%j", msg);
  });
  socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
    output("%j", msg);
  });
  return socket;
}
