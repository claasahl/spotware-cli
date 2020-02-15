import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"
import assert from "assert"

import config from "../../config"

const log = debug("spotware")
const input = log.extend("input")
const output = log.extend("output")

function login() {
    $.write(socket, {payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload: {clientId, clientSecret}})
}

function heartbeat() {
    $.write(socket, { payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} })
}

function connected() {
    log("connected")
    assert.strictEqual(pacemaker, null)
    pacemaker = setInterval(heartbeat, 10000)
}

function disconnected() {
    log("disconnected")
    assert.ok(pacemaker)
    clearTimeout(pacemaker!)
    pacemaker = null;
}

let pacemaker: NodeJS.Timeout | null = null
const { port, host, clientId, clientSecret } = config
const socket = $.connect(port, host)
socket.on("connect", connected)
socket.on("connect", login)
socket.on("close", disconnected)
socket.on("PROTO_MESSAGE.INPUT.*", (msg: $.ProtoMessages) => {
    input("%j", msg)
})
socket.on("PROTO_MESSAGE.OUTPUT.*", (msg: $.ProtoMessages) => {
    output("%j", msg)
})