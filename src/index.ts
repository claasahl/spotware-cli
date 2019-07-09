import tls from "tls";
import Pbf from "pbf";
import { EOL } from "os";

import * as util from "./util";
import { ProtoMessage } from "./OpenApiCommonMessages";
import {
  ProtoOAVersionResUtils,
  ProtoOAVersionReqUtils,
  ProtoOAErrorResUtils
} from "./OpenApiMessages";

// see compileRaw in compile.js
// https://github.com/mapbox/pbf/blob/master/compile.js#L16

// generate typescript based on .proto files
// generated typescript should be close to generated javascript by pbf

// pbf-ts OPTIONS
// --no-interface
// --no-class
// --uint32=string
// --single-file --multi-files???

function readProtoMessage(this: tls.TLSSocket, data: string) {
  {
    try {
      const buffer = Buffer.from(data, "binary");
      const message = util.deserialize(buffer);
      this.emit("PROTO_MESSAGE", message);
    } catch (error) {
      process.stderr.write("could not read/parse ProtoMessage: " + error + EOL);
    }
  }
}

export function writeProtoMessage(
  socket: tls.TLSSocket,
  message: ProtoMessage
) {
  const buffer = util.serialize(message);
  return socket.write(buffer, (err: Error) => {
    if (err) {
      socket.emit("error", err, message);
    } else {
      socket.emit("PROTO_MESSAGE", message);
    }
  });
}

export function connect(
  port: number,
  host: string,
  options?: tls.TlsOptions
): tls.TLSSocket {
  const socket = tls
    .connect(port, host, options)
    .setEncoding("binary")
    .setDefaultEncoding("binary")
    .on("data", readProtoMessage);
  return socket;
}

const socket = connect(
  5035,
  "live.ctraderapi.com"
);
socket.on("PROTO_MESSAGE", message => {
  const msg = {
    clientMsgId: message.clientMsgId,
    payloadType: message.payloadType,
    payload: message.payload
  };
  switch (message.payloadType) {
    case 2104:
      msg.payload = ProtoOAVersionReqUtils.read(new Pbf(message.payload));
      break;
    case 2105:
      msg.payload = ProtoOAVersionResUtils.read(new Pbf(message.payload));
      break;
    case 2142:
      msg.payload = ProtoOAErrorResUtils.read(new Pbf(message.payload));
      break;
  }
  process.stdout.write(JSON.stringify(msg) + EOL);
});
socket.on("close", () => process.exit(0));

// {"payloadType":2104,"payload":{}}
// {"payloadType":2105,"payload":{"version":"61"}}
process.stdin.on("data", data => {
  const message = JSON.parse(data);
  writeProtoMessage(socket, {
    clientMsgId: message.clientMsgId,
    payloadType: message.payloadType,
    payload: (() => {
      const pbf = new Pbf();
      switch (message.payloadType) {
        case 2104:
          ProtoOAVersionReqUtils.write(message.payload, pbf);
          break;
        case 2105:
          ProtoOAVersionResUtils.write(message.payload, pbf);
          break;
        case 2142:
          ProtoOAErrorResUtils.write(message.payload, pbf);
          break;
      }
      return pbf.finish();
    })()
  });
});
writeProtoMessage(socket, {
  clientMsgId: "moin",
  payloadType: 2104,
  payload: (() => {
    const pbf = new Pbf();
    ProtoOAVersionReqUtils.write({}, pbf);
    return pbf.finish();
  })()
});
