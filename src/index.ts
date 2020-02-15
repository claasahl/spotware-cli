import { EOL } from "os";
import fs from "fs";
import {
  connect,
  write,
  ProtoOAPayloadType,
  ProtoPayloadType
} from "@claasahl/spotware-adapter";

import CONFIG from "./config";

const { host, port, clientId, clientSecret, accessToken } = CONFIG;

const socket = connect(
  port,
  host
);
socket.on("PROTO_MESSAGE.*", message => {
  if ([2113, 2115, 2154, 2161, 2146].includes(message.payloadType)) {
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
  fs.writeFileSync("./assets.json", JSON.stringify(message, null, 2), {
    encoding: "utf8"
  })
);
socket.on("PROTO_MESSAGE.2115", message =>
  fs.writeFileSync("./symbols.json", JSON.stringify(message, null, 2), {
    encoding: "utf8"
  })
);
socket.on("PROTO_MESSAGE.2154", message =>
  fs.writeFileSync("./assetClasses.json", JSON.stringify(message, null, 2), {
    encoding: "utf8"
  })
);
socket.on("PROTO_MESSAGE.2161", message =>
  fs.writeFileSync("./categories.json", JSON.stringify(message, null, 2), {
    encoding: "utf8"
  })
);
socket.on("close", () => process.exit(0));

// {"payloadType":2104,"payload":{}}
// {"payloadType":2105,"payload":{"version":"61"}}
// {"payloadType":2127, "payload": { "ctidTraderAccountId": "5291983", "symbolId": [22395] }}
process.stdin.on("data", data => {
  const message = JSON.parse(data.toString());
  write(socket, message);
});
write(socket, { payloadType: 2104, clientMsgId: "moin", payload: {} });

const ctidTraderAccountId = 5291983;
const symbolId = [1]; //,47,22395];
write(socket, {
  payloadType: ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
  payload: { clientId, clientSecret }
});
setInterval(() => {
  write(socket, {
    payloadType: ProtoPayloadType.HEARTBEAT_EVENT,
    payload: {}
  });
}, 10000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload: { accessToken }
  });
}, 1000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ,
    payload: { accessToken }
  });
}, 2000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload: { accessToken, ctidTraderAccountId }
  });
}, 3000);

setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ,
    payload: {
      ctidTraderAccountId,
      symbolId: symbolId[0],
      volume: [100000, 50000, 1000]
    }
  });
}, 4000);

setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 4000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ,
    payload: { ctidTraderAccountId }
  });
}, 8000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 11000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ,
    payload: { ctidTraderAccountId }
  });
}, 14000);
setTimeout(() => {
  // write(socket, {
  //   payloadType: ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  //   payload: { ctidTraderAccountId, symbolId }
  // });
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ,
    payload: { ctidTraderAccountId: 5291983, symbolId: 22396, period: 1 }
  });
}, 18000);
