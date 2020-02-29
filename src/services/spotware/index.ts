import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"
import assert from "assert"

import config from "../../config"
import { DebugAccountStream } from "../account"
import { DebugSpotPricesStream } from "../spotPrices"
import { TradeSide, Price, Volume } from "../types"

const log = debug("spotware")
const input = log.extend("input")
const output = log.extend("output")
const error = log.extend("error")

const messages: $.ProtoMessages[] = []
function write(msg: $.ProtoMessages) {
    messages.push(msg)
}
function publish() {
    setImmediate(() => {
        const msg = messages.shift()
        if (msg) {
            $.write(socket, msg)
        }
    })
}

function clientMsgId(): string {
    return new Date().toISOString()
}

function isError(msg: $.ProtoMessages): msg is $.ProtoMessage50 {
    return msg.payloadType === $.ProtoPayloadType.ERROR_RES
}

function isOAError(msg: $.ProtoMessages): msg is $.ProtoMessage2142 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES
}

function request<REQ extends $.ProtoMessages, RES extends $.ProtoMessages>(request: REQ, payloadType: $.ProtoOAPayloadType | $.ProtoPayloadType, event: string) {
    const msgId = clientMsgId();
    setImmediate(() => write({ ...request, clientMsgId: msgId }))
    function isResponse(msg: $.ProtoMessages): msg is RES {
        return msg.payloadType === payloadType
    }
    function response(msg: $.ProtoMessages) {
        if (msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit(event, msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if (msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const { errorCode, description } = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function authApplication() {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES;
    const payload: $.ProtoOAApplicationAuthReq = { clientId, clientSecret }
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "authApplication")
}

function lookupAccounts() {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES;
    const payload: $.ProtoOAGetAccountListByAccessTokenReq = { accessToken }
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "lookupAccounts")
}

function authAccount(ctidTraderAccountId: number) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES;
    const payload: $.ProtoOAAccountAuthReq = { accessToken, ctidTraderAccountId }
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "authAccount")
}

function version(payload: $.ProtoOAVersionReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_RES;
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "version")
}

function trader(payload: $.ProtoOATraderReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_RES;
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "trader")
}

function symbolsList(payload: $.ProtoOASymbolsListReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES;
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "symbolsList")
}

function subscribeSpots(payload: $.ProtoOASubscribeSpotsReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES;
    request({ payloadType: requestPayloadType, payload }, responsePayloadType, "subscribeSpots")
}

function heartbeat() {
    setImmediate(() => write({ payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} }))
}

function connected() {
    log("connected")
    publisher = setInterval(publish, 300)
}

function disconnected() {
    log("disconnected")
    assert.ok(pacemaker)
    clearTimeout(pacemaker!)
    pacemaker = null;

    assert.ok(publisher)
    clearTimeout(publisher!)
    publisher = null;
}

const name = "BTC/EUR"
const symbol = Symbol.for(name)
const account = new DebugAccountStream(Symbol.for("EUR"));
const spotPrices = new DebugSpotPricesStream(symbol)
const symbolsByName = new Map<string, $.ProtoOALightSymbol>()
let pacemaker: NodeJS.Timeout | null = null
let publisher: NodeJS.Timeout | null = null
let ctidTraderAccountId: number | null = null
let symbolId: number | null = null
const { port, host, clientId, clientSecret, accessToken } = config
const socket = $.connect(port, host)
socket.on("connect", connected)
socket.on("close", disconnected)
socket.on("error", (err: Error) => { error(err.message); socket.end(); })
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    input("%j", msg)
})
socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
    output("%j", msg)
    if (pacemaker) {
        clearTimeout(pacemaker)
    }
    pacemaker = setTimeout(heartbeat, 10000)
})
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    function isAccountDisconnectedEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2164 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_DISCONNECT_EVENT;
    }
    if (isAccountDisconnectedEvent(msg)) {
        socket.end()
    }
})

socket.on("connect", () => version({}))
socket.on("connect", authApplication)
socket.on("authApplication", lookupAccounts)
socket.on("lookupAccounts", (msg: $.ProtoMessage2150) => {
    assert.strictEqual(msg.payload.ctidTraderAccount.length, 1);
    ctidTraderAccountId = msg.payload.ctidTraderAccount[0].ctidTraderAccountId
    authAccount(ctidTraderAccountId)
})
socket.on("authAccount", () => {
    trader({ ctidTraderAccountId: ctidTraderAccountId! })
    symbolsList({ ctidTraderAccountId: ctidTraderAccountId! })
})
socket.on("trader", (msg: $.ProtoMessage2122) => {
    const balance = msg.payload.trader.balance / 100
    const timestamp = Date.now();
    account.emitBalance({ balance, timestamp })
})
socket.on("symbolsList", (msg: $.ProtoMessage2115) => {
    setImmediate(() => {
        symbolsByName.clear();
        msg.payload.symbol.forEach(symbol => {
            symbolsByName.set(symbol.symbolName || "", symbol)
        })
        log("cached %d symbols by name", symbolsByName.size)
        socket.emit("symbolsListCachedByName")
    })
})
socket.on("symbolsListCachedByName", () => {
    const symbol = symbolsByName.get(name);
    if (symbol) {
        symbolId = symbol.symbolId;
        subscribeSpots({ ctidTraderAccountId: ctidTraderAccountId!, symbolId: [symbolId] })
    }
})
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    function isSpotPriceEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2131 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT;
    }
    if (isSpotPriceEvent(msg) && msg.payload.symbolId === symbolId) {
        if (msg.payload.ask) {
            const price = msg.payload.ask
            const timestamp = Date.now();
            spotPrices.emitAsk({ price, timestamp })
        }
        if (msg.payload.bid) {
            const price = msg.payload.bid
            const timestamp = Date.now();
            spotPrices.emitBid({ price, timestamp })
        }
    }
})
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    function isOrderEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2126 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT;
    }
    if (isOrderEvent(msg)) {
        if (msg.payload.executionType !== $.ProtoOAExecutionType.ORDER_ACCEPTED) {
            trader({ ctidTraderAccountId: ctidTraderAccountId! })
        }
        if (msg.payload.executionType === $.ProtoOAExecutionType.ORDER_FILLED && msg.payload.deal && !msg.payload.deal.closePositionDetail) {
            console.log(JSON.stringify(msg.payload))
            const order: Order = {
                symbol: Symbol.for(`${msg.payload.deal.symbolId}`),
                entry: msg.payload.deal.executionPrice!,
                volume: msg.payload.deal.volume / 100, // filledVolume?
                tradeSide: msg.payload.deal?.tradeSide === $.ProtoOATradeSide.BUY ? "BUY" : "SELL",
                profitLoss: 0
            }
            console.log(JSON.stringify(order))
            orders.push(order)
        } else if (msg.payload.executionType === $.ProtoOAExecutionType.ORDER_FILLED && msg.payload.deal && msg.payload.deal.closePositionDetail) {
            console.log(JSON.stringify(msg.payload))

            // const timestamp = msg.payload.deal.executionTimestamp;
            // const balance = msg.payload.deal.closePositionDetail.balance / 100;
            // account.emitBalance({timestamp, balance})

            function closeEnough(a: Order, b: Order): boolean {
                return a.symbol === b.symbol &&
                    a.entry === b.entry &&
                    a.volume === b.volume &&
                    a.tradeSide === b.tradeSide;
            }


            const order: Order = {
                symbol: Symbol.for(`${msg.payload.deal.symbolId}`),
                entry: msg.payload.deal.closePositionDetail.entryPrice,
                volume: msg.payload.deal.closePositionDetail.closedVolume! / 100,
                tradeSide: msg.payload.deal?.tradeSide === $.ProtoOATradeSide.SELL ? "BUY" : "SELL",
                profitLoss: 0
            }
            console.log(orders, order)
            const indexes = orders.map((o, index) => closeEnough(o, order) ? index : undefined).filter((i): i is number => i !== undefined).reverse()
            indexes.forEach(index => orders.splice(index, 1))
            console.log("---> deleted orders: ", indexes, orders)
        }
    }
})


interface Order {
    symbol: Symbol;
    entry: Price;
    volume: Volume;
    tradeSide: TradeSide
    profitLoss: Price;
}
let balance: number | null = null;
const orders: Order[] = []
// keep track of latest ask/bid price to calculate equity asap

account.on("balance", e => {
    balance = e.balance
    const profitLoss = orders.reduce((prev, curr) => prev + curr.profitLoss, 0)
    const equity = Math.round((balance! + profitLoss) * 100) / 100
    account.emitEquity({ equity, timestamp: e.timestamp })
})
spotPrices.on("ask", e => {
    orders
        .filter(({ tradeSide }) => tradeSide === "SELL")
        .forEach(order => {
            const price = e.price / 100000
            order.profitLoss = (order.entry - price) * order.volume
        })

    const profitLoss = orders.reduce((prev, curr) => prev + curr.profitLoss, 0)
    const equity = Math.round((balance! + profitLoss) * 100) / 100
    account.emitEquity({ equity, timestamp: e.timestamp })
})
spotPrices.on("bid", e => {
    orders
        .filter(({ tradeSide }) => tradeSide === "BUY")
        .forEach(order => {
            const price = e.price / 100000
            order.profitLoss = (price - order.entry) * order.volume
        })

    const profitLoss = orders.reduce((prev, curr) => prev + curr.profitLoss, 0)
    const equity = Math.round((balance! + profitLoss) * 100) / 100
    account.emitEquity({ equity, timestamp: e.timestamp })
})
account.on("equity", e => console.log("------------------------------>", e.equity, JSON.stringify(orders.map(o => o.profitLoss))))