import * as $ from "@claasahl/spotware-adapter"
import { EventEmitter } from "events"
import debug from "debug"
import {v4} from "uuid"

function isError(msg: $.ProtoMessages): msg is $.ProtoMessage50 {
    return msg.payloadType === $.ProtoPayloadType.ERROR_RES;
}

function isOAError(msg: $.ProtoMessages): msg is $.ProtoMessage2142 {
    return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES;
}

function testResponse<T extends $.ProtoMessages>(payloadType: T["payloadType"]) {
    return (msg: $.ProtoMessages): msg is T => {
        return msg.payloadType === payloadType;
    }
}

export interface Callback<T> {
    (payload: T): void
} 

interface SpotwareClientProps {
    host: string,
    port: number
    clientId: string,
    clientSecret: string,
    accessToken: string
}
export class SpotwareClient extends EventEmitter {
    // private readonly props: SpotwareClientProps;
    private readonly socket: $.SpotwareSocket;
    private readonly log: debug.Debugger;
    private readonly messages: $.ProtoMessages[] = [];

    constructor(props: SpotwareClientProps) {
        super();
        // this.props = Object.freeze(props);
        this.socket = $.connect(props.port, props.host);

        this.log = debug("spotware");
        this.socket.on("connect", () => this.log("connected"));
        this.socket.on("close", () => this.log("disconnected"));
        const input = this.log.extend("input");
        this.socket.on("PROTO_MESSAGE.INPUT.*", msg => input("%j", msg));
        const output = this.log.extend("output");
        this.socket.on("PROTO_MESSAGE.OUTPUT.*", msg => output("%j", msg));
        const error = this.log.extend("error");
        this.socket.on("error", (err: Error) => error(err.message));

        this.throttledPublisher();
        this.pacemaker();
    }

    private publish(msg: $.ProtoMessages): void {
        this.messages.push(msg);
    }

    private throttledPublisher() {
        const publish = () => {
            setImmediate(() => {
                const msg = this.messages.shift();
                if (msg) {
                    $.write(this.socket, msg);
                }
            });
        }
        const publisher: NodeJS.Timeout = setInterval(publish, 300);
        this.socket.on("close", () => clearInterval(publisher));
    }

    private pacemaker() {
        const heartbeat: $.ProtoMessages = { payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} }
        let pacemaker: NodeJS.Timeout | null = setTimeout(() => this.publish(heartbeat), 10000);
        this.socket.on("PROTO_MESSAGE.OUTPUT.*", () => {
            if (pacemaker) {
                clearTimeout(pacemaker);
            }
            pacemaker = setTimeout(() => this.publish(heartbeat), 10000);
        });
    }

    private awaitResponse<T extends $.ProtoMessages>(clientMsgId: string, isResponse: (msg: $.ProtoMessages) => msg is T, cb: (payload: T["payload"]) => void): void {
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    const event = $.ProtoOAPayloadType[msg.payloadType] || $.ProtoPayloadType[msg.payloadType]
                    setImmediate(() => this.emit(event, msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    accountAuth(payload: $.ProtoOAAccountAuthReq, cb: Callback<$.ProtoOAAccountAuthRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2103>($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    accountLogout(payload: $.ProtoOAAccountLogoutReq, cb: Callback<$.ProtoOAAccountLogoutRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2163>($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    applicationAuth(payload: $.ProtoOAApplicationAuthReq, cb: Callback<$.ProtoOAApplicationAuthRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2101>($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES);
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    assetClassList(payload: $.ProtoOAAssetClassListReq, cb: Callback<$.ProtoOAAssetClassListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2154>($.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    assetList(payload: $.ProtoOAAssetListReq, cb: Callback<$.ProtoOAAssetListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2113>($.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    dealList(payload: $.ProtoOADealListReq, cb: Callback<$.ProtoOADealListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2134>($.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    expectedMargin(payload: $.ProtoOAExpectedMarginReq, cb: Callback<$.ProtoOAExpectedMarginRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2140>($.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }

    version(payload: $.ProtoOAVersionReq, cb: Callback<$.ProtoOAVersionRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2105>($.ProtoOAPayloadType.PROTO_OA_VERSION_RES)
        this.awaitResponse(clientMsgId, isResponse, cb);
    }
}