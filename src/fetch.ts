import debug from "debug";
import assert from "assert"
import * as $ from "@claasahl/spotware-adapter";
import fs from "fs"

import config from "./config";

function main() {
  const messages: $.ProtoMessages[] = [];
  function write(msg: $.ProtoMessages) {
    messages.push(msg);
  }
  function publish() {
    setImmediate(() => {
      const msg = messages.shift();
      if (msg) {
        $.write(socket, msg);
      }
    });
  }

  function clientMsgId(): string {
    return new Date().toISOString();
  }

  function isError(msg: $.ProtoMessages): msg is $.ProtoMessage50 {
    return msg.payloadType === $.ProtoPayloadType.ERROR_RES;
  }

  function isOAError(msg: $.ProtoMessages): msg is $.ProtoMessage2142 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES;
  }

  function request<REQ extends $.ProtoMessages, RES extends $.ProtoMessages>(
    request: REQ,
    payloadType: $.ProtoOAPayloadType | $.ProtoPayloadType,
    event: string
  ) {
    const msgId = clientMsgId();
    setImmediate(() => write({ ...request, clientMsgId: msgId }));
    function isResponse(msg: $.ProtoMessages): msg is RES {
      return msg.payloadType === payloadType;
    }
    function response(msg: $.ProtoMessages) {
      if (msg.clientMsgId === msgId && isResponse(msg)) {
        setImmediate(() => socket.emit(event, msg));
        socket.off("PROTO_MESSAGE.INPUT.*", response);
      } else if (msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
        const { errorCode, description } = msg.payload;
        setImmediate(() =>
          socket.emit("error", new Error(`${errorCode}, ${description}`))
        );
        socket.off("PROTO_MESSAGE.INPUT.*", response);
      }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response);
  }

  function authApplication() {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ;
    const responsePayloadType =
      $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES;
    const payload: $.ProtoOAApplicationAuthReq = { clientId, clientSecret };
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "authApplication"
    );
  }

  function lookupAccounts() {
    const requestPayloadType =
      $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ;
    const responsePayloadType =
      $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES;
    const payload: $.ProtoOAGetAccountListByAccessTokenReq = { accessToken };
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "lookupAccounts"
    );
  }

  function authAccount(ctidTraderAccountId: number) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES;
    const payload: $.ProtoOAAccountAuthReq = { accessToken, ctidTraderAccountId };
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "authAccount"
    );
  }

  function symbolsList(payload: $.ProtoOASymbolsListReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES;
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "symbolsList"
    );
  }

  function getTickdata(payload: $.ProtoOAGetTickDataReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES;
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "getTickdata"
    );
  }

  const log = debug("spotware");
  const input = log.extend("input");
  const output = log.extend("output");
  const error = log.extend("error");

  setInterval(publish, 300);
  let ctidTraderAccountId: number | null = null;
  let symbolId: number | null = null;
  const symbolName = "BTC/EUR";
  const { port, host, clientId, clientSecret, accessToken } = config;
  const socket = $.connect(port, host);

  socket.on("error", (err: Error) => {
    error(err.message);
    socket.end();
  });
  socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    const blackList = [$.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES, $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES]
    if(blackList.includes(msg.payloadType)) {
      // way tooooo much, skip
      input("%j", {...msg, payload: "ABBREVIATED"});
    } else {
      input("%j", msg);
    }
  });
  socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
    output("%j", msg);
  });
  socket.on("connect", authApplication);
  socket.on("authApplication", lookupAccounts);
  socket.on("lookupAccounts", (msg: $.ProtoMessage2150) => {
    assert.strictEqual(msg.payload.ctidTraderAccount.length, 1);
    ctidTraderAccountId = msg.payload.ctidTraderAccount[0].ctidTraderAccountId;
    authAccount(ctidTraderAccountId);
  });
  socket.on("authAccount", () => {
    symbolsList({ ctidTraderAccountId: ctidTraderAccountId! });
  });
  socket.on("symbolsList", (msg: $.ProtoMessage2115) => {
    msg.payload.symbol.filter(s => s.symbolName === symbolName).forEach(s => symbolId = s.symbolId);
    const fromTimestamp = new Date("2020-04-05T11:00:00.000Z").getTime()
    const toTimestamp = new Date("2020-04-05T12:00:00.000Z").getTime()
    getTickdata({ ctidTraderAccountId: ctidTraderAccountId!, symbolId: symbolId!, fromTimestamp, toTimestamp, type: $.ProtoOAQuoteType.BID })
  });
  socket.on("getTickdata", (msg: $.ProtoMessage2146) => {
    assert.strictEqual(msg.payload.hasMore, false)
    const tickData = msg.payload.tickData
    for(let index = 1; index < tickData.length; index++) {
      const prev = tickData[index - 1]
      const curr = tickData[index]
      curr.timestamp = prev.timestamp + curr.timestamp
      curr.tick = prev.tick + curr.tick
    }

    const path = "./store/test.json";
    const stream = fs.createWriteStream(path)
    for(const tick of tickData) {
      stream.write(JSON.stringify({timestamp: tick.timestamp, bid: tick.tick / 10000}) + "\n")
    }
    stream.close()
    socket.end()
  })
}
main();
