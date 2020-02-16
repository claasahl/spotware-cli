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
            const stringified = JSON.stringify(msg)
            while(messages.length > 0 && JSON.stringify(messages[0]) === stringified) {
                messages.shift();
            }
    
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

function authApplication() {
    const msgId = clientMsgId();
    setImmediate(() => write({payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload: {clientId, clientSecret}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2101 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit("authApplication", msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const {errorCode, description} = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function lookupAccounts() {
    const msgId = clientMsgId();
    setImmediate(() => write({payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ, payload: {accessToken}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2150 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit("lookupAccounts", msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const {errorCode, description} = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function authAccount(ctidTraderAccountId: number) {
    const msgId = clientMsgId();
    setImmediate(() => write({payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ, payload: {accessToken, ctidTraderAccountId}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2103 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit("authAccount", msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const {errorCode, description} = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function trader(payload: $.ProtoOATraderReq) {
    const msgId = clientMsgId();
    setImmediate(() => write({payloadType: $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ, payload, clientMsgId:msgId}))
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2122 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_TRADER_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => socket.emit("trader", msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
            const {errorCode, description} = msg.payload
            setImmediate(() => socket.emit("error", new Error(`${errorCode}, ${description}`)))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
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

socket.on("connect", authApplication)
socket.on("authApplication", lookupAccounts)
socket.on("lookupAccounts", (msg: $.ProtoMessage2150) => {
    assert.strictEqual(msg.payload.ctidTraderAccount.length, 1);
    ctidTraderAccountId = msg.payload.ctidTraderAccount[0].ctidTraderAccountId
    authAccount(ctidTraderAccountId)
})
socket.on("authAccount", () => {
    trader({ctidTraderAccountId: ctidTraderAccountId!})
})
socket.on("trader", (msg: $.ProtoMessage2122) => {
    const balance = msg.payload.trader.balance / 100
    const timestamp = Date.now();
    account.emitBalance({balance, timestamp})
})
