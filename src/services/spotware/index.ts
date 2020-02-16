import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"
import assert from "assert"

import config from "../../config"
import { DebugAccountStream } from "../account"

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
        if(msg) {
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
    setImmediate(() => write({...request, clientMsgId:msgId}))
    function isResponse(msg: $.ProtoMessages): msg is RES {
        return msg.payloadType === payloadType
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit(event, msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const {errorCode, description} = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function authApplication() {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES;
    const payload: $.ProtoOAApplicationAuthReq = {clientId, clientSecret}
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "authApplication")
}

function lookupAccounts() {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES;
    const payload: $.ProtoOAGetAccountListByAccessTokenReq = {accessToken}
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "lookupAccounts")
}

function authAccount(ctidTraderAccountId: number) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES;
    const payload: $.ProtoOAAccountAuthReq ={accessToken, ctidTraderAccountId}
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "authAccount")
}

function version(payload: $.ProtoOAVersionReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_RES;
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "version")
}

function trader(payload: $.ProtoOATraderReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_TRADER_RES;
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "trader")
}

function symbolsList(payload: $.ProtoOASymbolsListReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES;
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "symbolsList")
}

function subscribeSpots(payload: $.ProtoOASubscribeSpotsReq) {
    const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ;
    const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES;
    request({payloadType: requestPayloadType, payload}, responsePayloadType, "subscribeSpots")
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


const account = new DebugAccountStream();
const symbolsByName = new Map<string, $.ProtoOALightSymbol>()
let pacemaker: NodeJS.Timeout | null = null
let publisher: NodeJS.Timeout | null = null
let ctidTraderAccountId: number | null = null
const { port, host, clientId, clientSecret, accessToken } = config
const socket = $.connect(port, host)
socket.on("connect", connected)
socket.on("close", disconnected)
socket.on("error", (err: Error) => {error(err.message); socket.end();})
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    input("%j", msg)
})
socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
    output("%j", msg)
    if(pacemaker) {
        clearTimeout(pacemaker)
    }
    pacemaker = setTimeout(heartbeat, 10000)
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
    trader({ctidTraderAccountId: ctidTraderAccountId!})
    symbolsList({ctidTraderAccountId: ctidTraderAccountId!})
})
socket.on("trader", (msg: $.ProtoMessage2122) => {
    const balance = msg.payload.trader.balance / 100
    const timestamp = Date.now();
    account.emitBalance({balance, timestamp})
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
    const name = "BTC/EUR"
    const symbol = symbolsByName.get(name);
    if(symbol) {
        subscribeSpots({ctidTraderAccountId: ctidTraderAccountId!, symbolId: [symbol.symbolId]})
    }
})
socket.on("PROTO_MESSAGE.INPUT.*", msg => {
    function isOrderEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2126 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT;
    }
    if(isOrderEvent(msg)) {
        trader({ctidTraderAccountId: ctidTraderAccountId!})
    }
})