import tls from "tls";
import Pbf from "pbf";
import { EOL } from "os";
import ms from "ms";

import * as util from "./util";
import * as $$ from "./OpenApiCommonMessages";
import * as $ from "./OpenApiMessages";
import readProtoMessages from "./readProtoMessages";
import writeProtoMessages from "./writeProtoMessages"

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
  message: $$.ProtoMessage
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
  "demo.ctraderapi.com"
);
socket.on("PROTO_MESSAGE", message => readProtoMessages(socket, message));
socket.on("PROTO_MESSAGE.*", message => process.stdout.write(JSON.stringify(message) + EOL));
socket.on("close", () => process.exit(0));

// {"payloadType":2104,"payload":{}}
// {"payloadType":2105,"payload":{"version":"61"}}
// {"payloadType":2127, "payload": { "ctidTraderAccountId": "5291983", "symbolId": [22395] }}
process.stdin.on("data", data => {
  const message = JSON.parse(data);
  writeProtoMessage(socket, {
    clientMsgId: message.clientMsgId,
    payloadType: message.payloadType,
    payload: writeProtoMessages(message)
  });
});
writeProtoMessage(socket, {
  clientMsgId: "moin",
  payloadType: 2104,
  payload: (() => {
    const pbf = new Pbf();
    $.ProtoOAVersionReqUtils.write({}, pbf);
    return pbf.finish();
  })()
});

const clientId = "";
const clientSecret = "";
const accessToken = "";
const refreshToken = "";
const ctidTraderAccountId = 0;
const symbolId = [1]; //,47,22395];
const toTimestamp = Date.now();
const fromTimestamp = toTimestamp - ms("7d");
writeProtoMessage(socket, {
  payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
  payload: (() => {
    const pbf = new Pbf();
    $.ProtoOAApplicationAuthReqUtils.write({ clientId, clientSecret }, pbf);
    return pbf.finish();
  })()
});
setInterval(() => {
  writeProtoMessage(socket, {
    payloadType: $$.ProtoPayloadType.HEARTBEAT_EVENT,
    payload: (() => {
      const pbf = new Pbf();
      $$.ProtoHeartbeatEventUtils.write({}, pbf);
      return pbf.finish();
    })()
  });
}, 10000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOAGetAccountListByAccessTokenReqUtils.write({ accessToken }, pbf);
      return pbf.finish();
    })()
  });
}, 1000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOAGetCtidProfileByTokenReqUtils.write({ accessToken }, pbf);
      return pbf.finish();
    })()
  });
}, 2000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOAAccountAuthReqUtils.write(
        { accessToken, ctidTraderAccountId },
        pbf
      );
      return pbf.finish();
    })()
  });
}, 3000);

setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOAExpectedMarginReqUtils.write(
        {
          ctidTraderAccountId,
          symbolId: symbolId[0],
          volume: [100000, 50000, 1000]
        },
        pbf
      );
      return pbf.finish();
    })()
  });
}, 4000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOADealListReqUtils.write(
        { ctidTraderAccountId, fromTimestamp, toTimestamp },
        pbf
      );
      return pbf.finish();
    })()
  });
}, 6000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOACashFlowHistoryListReqUtils.write(
        { ctidTraderAccountId, fromTimestamp, toTimestamp },
        pbf
      );
      return pbf.finish();
    })()
  });
}, 8000);

// setTimeout(() => {
//   writeProtoMessage(socket, {
//     payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ,
//     payload: (() => {
//       const pbf = new Pbf();
//       $.ProtoOASymbolsListReqUtils.write({ ctidTraderAccountId }, pbf);
//       return pbf.finish();
//     })()
//   });
// }, 4000);
// setTimeout(() => {
//   writeProtoMessage(socket, {
//     payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ,
//     payload: (() => {
//       const pbf = new Pbf();
//       $.ProtoOASymbolCategoryListReqUtils.write({ ctidTraderAccountId }, pbf);
//       return pbf.finish();
//     })()
//   });
// }, 8000);
// setTimeout(() => {
//   writeProtoMessage(socket, {
//     payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ,
//     payload: (() => {
//       const pbf = new Pbf();
//       $.ProtoOAAssetListReqUtils.write({ ctidTraderAccountId }, pbf);
//       return pbf.finish();
//     })()
//   });
// }, 11000);
// setTimeout(() => {
//   writeProtoMessage(socket, {
//     payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ,
//     payload: (() => {
//       const pbf = new Pbf();
//       $.ProtoOAAssetClassListReqUtils.write({ ctidTraderAccountId }, pbf);
//       return pbf.finish();
//     })()
//   });
// }, 14000);
setTimeout(() => {
  writeProtoMessage(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
    payload: (() => {
      const pbf = new Pbf();
      $.ProtoOASubscribeSpotsReqUtils.write(
        { ctidTraderAccountId, symbolId },
        pbf
      );
      return pbf.finish();
    })()
  });
}, 18000);
