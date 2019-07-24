import tls from "tls";
import { EOL } from "os";
import ms from "ms";
import fs from "fs";
import * as $ from "@claasahl/spotware-protobuf";

import * as util from "./util";
import readProtoMessages from "./readProtoMessages";
import writeProtoMessages from "./writeProtoMessages";

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

function writeProtoMessage(socket: tls.TLSSocket, message: $.ProtoMessage) {
  const buffer = util.serialize(message);
  return socket.write(buffer, (err: Error) => {
    if (err) {
      socket.emit("error", err, message);
    } else {
      socket.emit("PROTO_MESSAGE", message);
    }
  });
}

interface Message<P, T> {
  payloadType: T;
  payload: P;
  clientMsgId?: string;
}
export type ProtoMessages =
  | Message<$.ProtoMessage, 5>
  | Message<$.ProtoErrorRes, 50>
  | Message<$.ProtoHeartbeatEvent, 51>
  | Message<$.ProtoOAApplicationAuthReq, 2100>
  | Message<$.ProtoOAApplicationAuthRes, 2101>
  | Message<$.ProtoOAAccountAuthReq, 2102>
  | Message<$.ProtoOAAccountAuthRes, 2103>
  | Message<$.ProtoOAVersionReq, 2104>
  | Message<$.ProtoOAVersionRes, 2105>
  | Message<$.ProtoOANewOrderReq, 2106>
  | Message<$.ProtoOATrailingSLChangedEvent, 2107>
  | Message<$.ProtoOACancelOrderReq, 2108>
  | Message<$.ProtoOAAmendOrderReq, 2109>
  | Message<$.ProtoOAAmendPositionSLTPReq, 2110>
  | Message<$.ProtoOAClosePositionReq, 2111>
  | Message<$.ProtoOAAssetListReq, 2112>
  | Message<$.ProtoOAAssetListRes, 2113>
  | Message<$.ProtoOASymbolsListReq, 2114>
  | Message<$.ProtoOASymbolsListRes, 2115>
  | Message<$.ProtoOASymbolByIdReq, 2116>
  | Message<$.ProtoOASymbolByIdRes, 2117>
  | Message<$.ProtoOASymbolsForConversionReq, 2118>
  | Message<$.ProtoOASymbolsForConversionRes, 2119>
  | Message<$.ProtoOASymbolChangedEvent, 2120>
  | Message<$.ProtoOATraderReq, 2121>
  | Message<$.ProtoOATraderRes, 2122>
  | Message<$.ProtoOATraderUpdatedEvent, 2123>
  | Message<$.ProtoOAReconcileReq, 2124>
  | Message<$.ProtoOAReconcileRes, 2125>
  | Message<$.ProtoOAExecutionEvent, 2126>
  | Message<$.ProtoOASubscribeSpotsReq, 2127>
  | Message<$.ProtoOASubscribeSpotsRes, 2128>
  | Message<$.ProtoOAUnsubscribeSpotsReq, 2129>
  | Message<$.ProtoOAUnsubscribeSpotsRes, 2130>
  | Message<$.ProtoOASpotEvent, 2131>
  | Message<$.ProtoOAOrderErrorEvent, 2132>
  | Message<$.ProtoOADealListReq, 2133>
  | Message<$.ProtoOADealListRes, 2134>
  | Message<$.ProtoOASubscribeLiveTrendbarReq, 2135>
  | Message<$.ProtoOAUnsubscribeLiveTrendbarReq, 2136>
  | Message<$.ProtoOAGetTrendbarsReq, 2137>
  | Message<$.ProtoOAGetTrendbarsRes, 2138>
  | Message<$.ProtoOAExpectedMarginReq, 2139>
  | Message<$.ProtoOAExpectedMarginRes, 2140>
  | Message<$.ProtoOAMarginChangedEvent, 2141>
  | Message<$.ProtoOAErrorRes, 2142>
  | Message<$.ProtoOACashFlowHistoryListReq, 2143>
  | Message<$.ProtoOACashFlowHistoryListRes, 2144>
  | Message<$.ProtoOAGetTickDataReq, 2145>
  | Message<$.ProtoOAGetTickDataRes, 2146>
  | Message<$.ProtoOAAccountsTokenInvalidatedEvent, 2147>
  | Message<$.ProtoOAClientDisconnectEvent, 2148>
  | Message<$.ProtoOAGetAccountListByAccessTokenReq, 2149>
  | Message<$.ProtoOAGetAccountListByAccessTokenRes, 2150>
  | Message<$.ProtoOAGetCtidProfileByTokenReq, 2151>
  | Message<$.ProtoOAGetCtidProfileByTokenRes, 2152>
  | Message<$.ProtoOAAssetClassListReq, 2153>
  | Message<$.ProtoOAAssetClassListRes, 2154>
  | Message<$.ProtoOADepthEvent, 2155>
  | Message<$.ProtoOASubscribeDepthQuotesReq, 2156>
  | Message<$.ProtoOASubscribeDepthQuotesRes, 2157>
  | Message<$.ProtoOAUnsubscribeDepthQuotesReq, 2158>
  | Message<$.ProtoOAUnsubscribeDepthQuotesRes, 2159>
  | Message<$.ProtoOASymbolCategoryListReq, 2160>
  | Message<$.ProtoOASymbolCategoryListRes, 2161>
  | Message<$.ProtoOAAccountLogoutReq, 2162>
  | Message<$.ProtoOAAccountLogoutRes, 2163>
  | Message<$.ProtoOAAccountDisconnectEvent, 2164>;
function write(socket: tls.TLSSocket, message: ProtoMessages) {
  writeProtoMessage(socket, {
    clientMsgId: message.clientMsgId,
    payloadType: message.payloadType,
    payload: writeProtoMessages(message)
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
socket.on("PROTO_MESSAGE.*", message => {
  if ([2113, 2115, 2154, 2161].includes(message.payloadType)) {
    process.stdout.write(
      JSON.stringify({
        timestamp: new Date(),
        msg: { ...message, payload: "****" }
      }) + EOL
    );
  } else {
    process.stdout.write(
      JSON.stringify({ timestamp: new Date(), msg: message }) + EOL
    );
  }
});
socket.on("PROTO_MESSAGE.2113", message =>
  fs.writeFileSync("./assets.json", JSON.stringify(message, null, 2))
);
socket.on("PROTO_MESSAGE.2115", message =>
  fs.writeFileSync("./symbols.json", JSON.stringify(message))
);
socket.on("PROTO_MESSAGE.2154", message =>
  fs.writeFileSync("./assetClasses.json", JSON.stringify(message, null, 2))
);
socket.on("PROTO_MESSAGE.2161", message =>
  fs.writeFileSync("./categories.json", JSON.stringify(message, null, 2))
);
socket.on("close", () => process.exit(0));

// {"payloadType":2104,"payload":{}}
// {"payloadType":2105,"payload":{"version":"61"}}
// {"payloadType":2127, "payload": { "ctidTraderAccountId": "5291983", "symbolId": [22395] }}
process.stdin.on("data", data => {
  const message = JSON.parse(data);
  write(socket, message);
});
write(socket, { payloadType: 2104, clientMsgId: "moin", payload: {} });

const clientId = "";
const clientSecret = "";
const accessToken = "";
const refreshToken = "";
const ctidTraderAccountId = 0;
const symbolId = [1]; //,47,22395];
const toTimestamp = Date.now();
const fromTimestamp = toTimestamp - ms("7d");
write(socket, {
  payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
  payload: { clientId, clientSecret }
});
setInterval(() => {
  write(socket, {
    payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT,
    payload: {}
  });
}, 10000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload: { accessToken }
  });
}, 1000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ,
    payload: { accessToken }
  });
}, 2000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload: { accessToken, ctidTraderAccountId }
  });
}, 3000);

setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ,
    payload: {
      ctidTraderAccountId,
      symbolId: symbolId[0],
      volume: [100000, 50000, 1000]
    }
  });
}, 4000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ,
    payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
  });
}, 6000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ,
    payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
  });
}, 8000);

setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 4000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ,
    payload: { ctidTraderAccountId }
  });
}, 8000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 11000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 14000);
setTimeout(() => {
  write(socket, {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
    payload: { ctidTraderAccountId, symbolId }
  });
}, 18000);
