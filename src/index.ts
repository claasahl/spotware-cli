import tls from "tls";
import Pbf from "pbf";

import * as util from "./util";
import { ProtoMessage } from "./OpenApiCommonMessages";
import {
  ProtoOAVersionResUtils,
  ProtoOAVersionReqUtils
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
      console.log("could not read/parse ProtoMessage", error);
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

    // tls.TLSSocket
    .on("OCSPResponse", response => console.log("OCSPResponse", response))
    .on("secureConnect", () => console.log("secureConnect"))
    .on("session", session => console.log("session", session))

    // net.Socket
    .on("close", (had_error: boolean) => console.log("close", had_error))
    .on("connect", () => console.log("connect"))
    //.on("data", (data: Buffer) => console.log("data", data))
    .on("drain", () => console.log("drain"))
    .on("end", () => console.log("end"))
    .on("error", (err: Error) => console.log("error", err))
    .on(
      "lookup",
      (err: Error, address: string, family: string | number, host: string) =>
        console.log("lookup", err, address, family, host)
    )
    .on("timeout", () => console.log("timeout"))

    // "Spotware"
    .on("data", readProtoMessage);
  return socket;
}

const socket = connect(
  5035,
  "live.ctraderapi.com"
);
socket.on("PROTO_MESSAGE", message => {
  const msg = {
    payloadType: message.payloadType,
    payload: message.payload
  };
  switch (message.payloadType) {
    case 2104:
      msg.payload = ProtoOAVersionReqUtils.read(new Pbf(message.payload));
    case 2105:
      msg.payload = ProtoOAVersionResUtils.read(new Pbf(message.payload));
  }
  console.log(msg);
});
writeProtoMessage(socket, {
  clientMsgId: "moin",
  payloadType: 2104,
  payload: Buffer.alloc(0)
});
