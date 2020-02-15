import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"
import assert from "assert"

import config from "../../config"

const log = debug("spotware")
const input = log.extend("input")
const output = log.extend("output")
const error = log.extend("error")

function clientMsgId(): string {
    return new Date().toISOString()
}

function isError(msg: $.ProtoMessages): msg is $.ProtoMessage50 {
    return msg.payloadType === $.ProtoPayloadType.ERROR_RES
}

function isOAError(msg: $.ProtoMessages): msg is $.ProtoMessage2142 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES
}

interface Callback<RES extends $.ProtoMessages> {
    (err: $.ProtoMessage50 | $.ProtoMessage2142 | null, msg?: RES): void;
}

function authApplication(callback: Callback<$.ProtoMessage2101>) {
    const msgId = clientMsgId();
    setImmediate(() => $.write(socket, {payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload: {clientId, clientSecret}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2101 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => callback(null, msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isOAError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function lookupAccounts(callback: Callback<$.ProtoMessage2150>) {
    const msgId = clientMsgId();
    setImmediate(() => $.write(socket, {payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ, payload: {accessToken}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2150 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => callback(null, msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isOAError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function authAccount(ctidTraderAccountId: number, callback: Callback<$.ProtoMessage2103>) {
    const msgId = clientMsgId();
    setImmediate(() => $.write(socket, {payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ, payload: {accessToken, ctidTraderAccountId}, clientMsgId: msgId}));
    function isResponse(msg: $.ProtoMessages): msg is $.ProtoMessage2103 {
        return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES
    }
    function response(msg: $.ProtoMessages) {
        if(msg.clientMsgId === msgId && isResponse(msg)) {
            setImmediate(() => callback(null, msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        } else if(msg.clientMsgId === msgId && isOAError(msg)) {
            setImmediate(() => callback(msg))
            socket.off("PROTO_MESSAGE.INPUT.*", response);
        }
    }
    socket.on("PROTO_MESSAGE.INPUT.*", response)
}

function heartbeat() {
    setImmediate(() => $.write(socket, { payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} }))
}

function connected() {
    log("connected")
    authApplication((err, msg) => {
        if(err) {
            error("%s: %s", err.payload.errorCode, err.payload.description)
        } else if(msg) {
            lookupAccounts((err, msg) => {
                if(err) {
                    error("%s: %s", err.payload.errorCode, err.payload.description)
                } else if(msg) {
                    const {ctidTraderAccountId} = msg.payload.ctidTraderAccount[0]
                    authAccount(ctidTraderAccountId, () => {})
                }
            })
        }
    })
}

function disconnected() {
    log("disconnected")
    assert.ok(pacemaker)
    clearTimeout(pacemaker!)
    pacemaker = null;
}

let pacemaker: NodeJS.Timeout | null = null
const { port, host, clientId, clientSecret, accessToken } = config
const socket = $.connect(port, host)
socket.on("connect", connected)
socket.on("close", disconnected)
socket.on("PROTO_MESSAGE.INPUT.*", (msg: $.ProtoMessages) => {
    input("%j", msg)
})
socket.on("PROTO_MESSAGE.OUTPUT.*", (msg: $.ProtoMessages) => {
    output("%j", msg)
    if(pacemaker) {
        clearTimeout(pacemaker)
    }
    pacemaker = setTimeout(heartbeat, 10000)
})