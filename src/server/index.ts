import { Server, Socket } from "net";
import debug from "debug";
import { SpotwareSocket } from "@claasahl/spotware-adapter";

import { requests } from "./requests";

const log = debug("custom-server");

const port = Number(process.env.port);
const server = new Server(serve);
server.listen(port, () => log(`listening on port ${port}`));

function serve(socket: Socket): void {
  log("new connection");
  const s = new SpotwareSocket(socket);
  const dealWithIt = requests(s);
  s.on("error", log);
  s.on("data", dealWithIt);
}
