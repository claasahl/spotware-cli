import * as $ from "@claasahl/spotware-adapter";
import debug from "debug";
import assert from "assert";

import config from "../../config";
import { DebugAccountStream } from "../types/account";
import { DebugSpotPricesStream } from "../types/spotPrices";
import { TradeSide, Price, Order, Timestamp } from "../types/types";

const log = debug("spotware");
const input = log.extend("input");
const output = log.extend("output");
const error = log.extend("error");

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

function version(payload: $.ProtoOAVersionReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_RES;
  request(
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "version"
  );
}

function trader(payload: $.ProtoOATraderReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_RES;
  request(
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "trader"
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

function subscribeSpots(payload: $.ProtoOASubscribeSpotsReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES;
  request(
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "subscribeSpots"
  );
}

function heartbeat() {
  setImmediate(() =>
    write({ payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} })
  );
}

function connected() {
  log("connected");
  publisher = setInterval(publish, 300);
}

function disconnected() {
  log("disconnected");
  assert.ok(pacemaker);
  clearTimeout(pacemaker!);
  pacemaker = null;

  assert.ok(publisher);
  clearTimeout(publisher!);
  publisher = null;
}

const name = "BTC/EUR";
const symbol = Symbol.for(name);
const currency = Symbol.for("EUR");
const account = new DebugAccountStream({ currency });
const spotPrices = new DebugSpotPricesStream({ symbol });
const symbolsByName = new Map<string, $.ProtoOALightSymbol>();
const symbolsById = new Map<number, $.ProtoOALightSymbol>();
let pacemaker: NodeJS.Timeout | null = null;
let publisher: NodeJS.Timeout | null = null;
let ctidTraderAccountId: number | null = null;
let symbolId: number | null = null;
const { port, host, clientId, clientSecret, accessToken } = config;
const socket = $.connect(port, host);
socket.on("connect", connected);
socket.on("close", disconnected);
socket.on("error", (err: Error) => {
  error(err.message);
  socket.end();
});
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
  input("%j", msg);
});
socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
  output("%j", msg);
  if (pacemaker) {
    clearTimeout(pacemaker);
  }
  pacemaker = setTimeout(heartbeat, 10000);
});
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
  function isAccountDisconnectedEvent(
    msg: $.ProtoMessages
  ): msg is $.ProtoMessage2164 {
    return (
      msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_DISCONNECT_EVENT
    );
  }
  if (isAccountDisconnectedEvent(msg)) {
    socket.end();
  }
});

socket.on("connect", () => version({}));
socket.on("connect", authApplication);
socket.on("authApplication", lookupAccounts);
socket.on("lookupAccounts", (msg: $.ProtoMessage2150) => {
  assert.strictEqual(msg.payload.ctidTraderAccount.length, 1);
  ctidTraderAccountId = msg.payload.ctidTraderAccount[0].ctidTraderAccountId;
  authAccount(ctidTraderAccountId);
});
socket.on("authAccount", () => {
  trader({ ctidTraderAccountId: ctidTraderAccountId! });
  symbolsList({ ctidTraderAccountId: ctidTraderAccountId! });
});
socket.on("trader", (msg: $.ProtoMessage2122) => {
  const balance = msg.payload.trader.balance / 100;
  const timestamp = Date.now();
  account.emitBalance({ balance, timestamp });
});
socket.on("symbolsList", (msg: $.ProtoMessage2115) => {
  setImmediate(() => {
    symbolsByName.clear();
    msg.payload.symbol.forEach(symbol => {
      symbolsByName.set(symbol.symbolName!, symbol);
    });
    log("cached %d symbols by name", symbolsByName.size);
    socket.emit("symbolsListCachedByName");
  });
});
socket.on("symbolsList", (msg: $.ProtoMessage2115) => {
  setImmediate(() => {
    symbolsById.clear();
    msg.payload.symbol.forEach(symbol => {
      symbolsById.set(symbol.symbolId, symbol);
    });
    log("cached %d symbols by id", symbolsByName.size);
    socket.emit("symbolsListCachedById");
  });
});
socket.on("symbolsListCachedByName", () => {
  const symbol = symbolsByName.get(name);
  if (symbol) {
    symbolId = symbol.symbolId;
    subscribeSpots({
      ctidTraderAccountId: ctidTraderAccountId!,
      symbolId: [symbolId]
    });
  }
});
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
  function isSpotPriceEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2131 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT;
  }
  if (isSpotPriceEvent(msg) && msg.payload.symbolId === symbolId) {
    if (msg.payload.ask) {
      const ask = msg.payload.ask;
      const timestamp = Date.now();
      spotPrices.emitAsk({ ask, timestamp });
    }
    if (msg.payload.bid) {
      const bid = msg.payload.bid;
      const timestamp = Date.now();
      spotPrices.emitBid({ bid, timestamp });
    }
  }
});
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
  function isOrderEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2126 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT;
  }
  if (isOrderEvent(msg)) {
    if (msg.payload.executionType !== $.ProtoOAExecutionType.ORDER_ACCEPTED) {
      trader({ ctidTraderAccountId: ctidTraderAccountId! });
    }
    if (msg.payload.executionType === $.ProtoOAExecutionType.ORDER_FILLED) {
      if (!msg.payload.order || !msg.payload.deal) {
        return;
      }
      if (msg.payload.order.closingOrder) {
        orders
          .get(msg.payload.order.positionId!)
          ?.forEach(o => (balance! += o.profitLoss));
        orders.delete(msg.payload.order.positionId!);
        console.log(orders);
      } else {
        const symbol = Symbol.for(
          symbolsById.get(msg.payload.deal.symbolId!)?.symbolName!
        );
        const tradeSide: TradeSide =
          msg.payload.deal?.tradeSide === $.ProtoOATradeSide.BUY
            ? "BUY"
            : "SELL";
        const entry = msg.payload.deal.executionPrice!;
        const volume = msg.payload.deal.volume / 100; // filledVolume?
        const profitLossSELL = entry - ask!;
        const profitLossBUY = bid! - entry;
        const profitLoss =
          (tradeSide === "SELL" ? profitLossSELL : profitLossBUY) * volume;
        const order: Order = { symbol, entry, volume, tradeSide, profitLoss };
        console.log(JSON.stringify(order));
        if (orders.has(msg.payload.deal.positionId)) {
          const all = orders.get(msg.payload.deal.positionId);
          const toBeDeleted: number[] = [];
          console.log("BEFORE", JSON.stringify(all));
          all?.forEach((o, index) => {
            if (order.tradeSide !== o.tradeSide && order.volume >= o.volume) {
              order.volume -= o.volume;
              order.profitLoss =
                (tradeSide === "SELL" ? profitLossSELL : profitLossBUY) *
                order.volume;
              o.volume = 0;
              balance! += o.profitLoss;
              toBeDeleted.push(index);
            }
          });
          toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
          all?.push(order);
          console.log("AFTER", JSON.stringify(all));
        } else {
          orders.set(msg.payload.deal.positionId, [order]);
        }
      }
    }
  }
});

let balance: Price | null = null;
let ask: Price | null = null;
let bid: Price | null = null;
const orders: Map<number, Order[]> = new Map();
function emitEquity(timestamp: Timestamp) {
  let profitLoss = 0;
  orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
  const equity = Math.round((balance! + profitLoss) * 100) / 100;
  account.emitEquity({ equity, timestamp });
}

account.on("balance", e => {
  if (balance === null) {
    balance = e.balance;
  } else {
    console.log(
      "-------------------------------",
      balance,
      e.balance,
      Math.abs(balance - e.balance),
      "-------------------------------"
    );
  }
  emitEquity(e.timestamp);
});
spotPrices.on("ask", e => {
  ask = e.ask / 100000;
  orders.forEach(o => {
    o.forEach(order => {
      if (order.tradeSide === "SELL") {
        order.profitLoss = (order.entry - ask!) * order.volume;
      }
    });
  });
  emitEquity(e.timestamp);
});
spotPrices.on("bid", e => {
  bid = e.bid / 100000;
  orders.forEach(o => {
    o.forEach(order => {
      if (order.tradeSide === "BUY") {
        order.profitLoss = (bid! - order.entry) * order.volume;
      }
    });
  });
  emitEquity(e.timestamp);
});
account.on("equity", e =>
  console.log("------------------------------>", e.equity)
);
