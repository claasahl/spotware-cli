import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"

interface Publisher {
  publish: (msg: $.ProtoMessages) => void,
  done: () => void
}

function publisher(socket: $.SpotwareSocket): Publisher {
  const messages: $.ProtoMessages[] = [];
  function publish() {
    setImmediate(() => {
      const msg = messages.shift();
      if (msg) {
        $.write(socket, msg);
      }
    });
  }
  const publisher: NodeJS.Timeout = setInterval(publish, 300)
  return {
    publish: (msg: $.ProtoMessages) => messages.push(msg),
    done: () => clearInterval(publisher)
  }
}

function pacemaker(socket: $.SpotwareSocket, publisher: Publisher) {
  const heartbeat: $.ProtoMessages = { payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} }
  let pacemaker: NodeJS.Timeout | null = setTimeout(() => publisher.publish(heartbeat), 10000);
  socket.on("PROTO_MESSAGE.OUTPUT.*", () => {
    if (pacemaker) {
      clearTimeout(pacemaker);
    }
    pacemaker = setTimeout(() => publisher.publish(heartbeat), 10000);
  });
}

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
  const P = publisher(socket);
  socket.on("connect", () => {
    log("connected");
    pacemaker(socket, P);
  })
  socket.on("close", () => {
    log("disconnect")
    P.done();
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
