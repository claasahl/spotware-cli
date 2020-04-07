import debug from "debug";
import assert from "assert"
import * as $ from "@claasahl/spotware-adapter";
import fs from "fs"
import ms from "ms";

import config from "./config";
import * as B from "./services/base"

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
    event: string,
    clientMessageId?: string
  ) {
    const msgId = clientMessageId ? clientMessageId : clientMsgId();
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

  function getTickdata(payload: $.ProtoOAGetTickDataReq, msgId: string) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES;
    request(
      { payloadType: requestPayloadType, payload },
      responsePayloadType,
      "getTickdata",
      msgId
    );
  }

  const log = debug("spotware");
  const input = log.extend("input");
  const output = log.extend("output");
  const error = log.extend("error");

  setInterval(publish, 300);
  const path = "./store/test2.json"
  const fromTimestamp = new Date("2020-04-05T00:00:00.000Z").getTime()
  const toTimestamp = new Date("2020-04-05T12:00:00.000Z").getTime()
  interface Interval {fromTimestamp: number, toTimestamp: number, type: $.ProtoOAQuoteType}
  const intervals: Interval[] = []
  const offset = ms("1h")
  let timestamp = fromTimestamp;
  while(timestamp + offset < toTimestamp) {
    intervals.push({fromTimestamp: timestamp, toTimestamp: timestamp+offset, type: $.ProtoOAQuoteType.BID})
    intervals.push({fromTimestamp: timestamp, toTimestamp: timestamp+offset, type: $.ProtoOAQuoteType.ASK})
    timestamp += offset;
  }
  intervals.push({fromTimestamp: timestamp, toTimestamp, type: $.ProtoOAQuoteType.BID})
  intervals.push({fromTimestamp: timestamp, toTimestamp, type: $.ProtoOAQuoteType.ASK})
  const spotPrices: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] = []
  function nextInterval() {
    const interval = intervals.shift()
    if(interval) {
      log("fetching: %j", {from: new Date(interval.fromTimestamp), to: new Date(interval.toTimestamp), type: interval.type})
      const msgId = JSON.stringify(interval)
      getTickdata({ ctidTraderAccountId: ctidTraderAccountId!, symbolId: symbolId!, ...interval }, msgId)
    }
  }
  function interpolate(msg: $.ProtoMessage2146, type: "ask" | "bid"): (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] {
    const tickData = msg.payload.tickData
    for(let index = 1; index < tickData.length; index++) {
      const prev = tickData[index - 1]
      const curr = tickData[index]
      curr.timestamp = prev.timestamp + curr.timestamp
      curr.tick = prev.tick + curr.tick
    }
    if(type === "ask") {
      return tickData.map(t => ({timestamp: t.timestamp, ask: t.tick / 100000}));
    } else if(type === "bid") {
      return tickData.map(t => ({timestamp: t.timestamp, bid: t.tick / 100000}));
    }
    return []
  }

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
    if(fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    nextInterval();
  });
  socket.on("getTickdata", async (msg: $.ProtoMessage2146) => {
    assert.strictEqual(msg.payload.hasMore, false)
    const interval = JSON.parse(msg.clientMsgId || "") as Interval;
    if(interval.type === $.ProtoOAQuoteType.BID) {
      spotPrices.splice(0)
      spotPrices.push(...interpolate(msg, "ask"))
    } else if(interval.type === $.ProtoOAQuoteType.ASK) {
      spotPrices.push(...interpolate(msg, "bid"))

      const ticks = spotPrices.sort((a, b) => a.timestamp - b.timestamp)
      const stream = fs.createWriteStream(path, {flags: "a"})
      for(const tick of ticks) {
        stream.write(JSON.stringify(tick) + "\n")
      }
      stream.close()
    }
    nextInterval();
  })
}
main();
