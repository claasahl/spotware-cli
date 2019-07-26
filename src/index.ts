import { EOL } from "os";
import { fromEvent, of, pipe, EMPTY } from "rxjs";
import { map, flatMap, scan, toArray } from "rxjs/operators";
import ms from "ms";
import fs from "fs";
import {
  connect,
  write,
  ProtoOAPayloadType,
  ProtoPayloadType,
  ProtoOAQuoteType,
  ProtoMessages
} from "@claasahl/spotware-adapter";

const socket = connect(
  5035,
  "demo.ctraderapi.com"
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
// const toTimestamp = Date.now();
// const fromTimestamp = toTimestamp - ms("7d");
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
    payloadType: ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ,
    payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
  });
}, 6000);
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ,
    payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
  });
}, 8000);

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
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
    payload: { ctidTraderAccountId, symbolId }
  });
}, 18000);

const ASK = "PROTO_OA_GET_TICKDATA_REQ ASK 1";
const BID = "PROTO_OA_GET_TICKDATA_REQ BID 1";
const toTimestamp = new Date("2019-07-24T18:20:34.433Z").getTime(); //Date.now();
const fromTimestamp = new Date("2019-07-24T18:20:01.361Z").getTime(); //toTimestamp - ms("1min");
setTimeout(() => {
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
    payload: {
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
      symbolId: 1,
      type: ProtoOAQuoteType.ASK
    },
    clientMsgId: ASK
  });
  write(socket, {
    payloadType: ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
    payload: {
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
      symbolId: 1,
      type: ProtoOAQuoteType.BID
    },
    clientMsgId: BID
  });
}, 5000);
// socket.on("PROTO_MESSAGE.2146", abc)
const observable = fromEvent<ProtoMessages>(socket, "PROTO_MESSAGE.2146");
observable;
const a = observable.pipe(
  extrapolateTickData(),
  map(value => ({ ...value, date: new Date(value.timestamp) }))
);
a.subscribe(console.log);

function filter2146() {
  return pipe(
    flatMap((value: ProtoMessages) => {
      if (value.payloadType === 2146) {
        return of(value);
      }
      return EMPTY;
    })
    // filter(value => value.payloadType === 2146),
  );
}

function extrapolateTickData() {
  return pipe(
    filter2146(),
    flatMap(value =>
      of(...value.payload.tickData).pipe(
        scan((acc, value) => {
          return {
            timestamp: acc.timestamp + value.timestamp,
            tick: acc.tick + value.tick
          };
        }),
        toArray(),
        map(ticks => ticks.reverse()),
        flatMap(value => of(...value))
      )
    )
  );
}
