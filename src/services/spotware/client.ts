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

    accountAuth(payload: $.ProtoOAAccountAuthReq, cb: Callback<$.ProtoOAAccountAuthRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2103 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_ACCOUNT_AUTH_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    accountLogout(payload: $.ProtoOAAccountLogoutReq, cb: Callback<$.ProtoOAAccountLogoutRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2163 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_ACCOUNT_LOGOUT_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    applicationAuth(payload: $.ProtoOAApplicationAuthReq, cb: Callback<$.ProtoOAApplicationAuthRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2105 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_APPLICATION_AUTH_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    assetClassList(payload: $.ProtoOAAssetClassListReq, cb: Callback<$.ProtoOAAssetClassListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2154 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_ASSET_CLASS_LIST_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    assetList(payload: $.ProtoOAAssetListReq, cb: Callback<$.ProtoOAAssetListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2113 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_ASSET_LIST_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    dealList(payload: $.ProtoOADealListReq, cb: Callback<$.ProtoOADealListRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2134 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_DEAL_LIST_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    expectedMargin(payload: $.ProtoOAExpectedMarginReq, cb: Callback<$.ProtoOAExpectedMarginRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2140 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_EXPECTED_MARGIN_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }

    version(payload: $.ProtoOAVersionReq, cb: Callback<$.ProtoOAVersionRes>) {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ, payload, clientMsgId })
        const isResponse = (msg: $.ProtoMessages): msg is $.ProtoMessage2105 => {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_VERSION_RES;
        }
        const response = (msg: $.ProtoMessages) => {
            if (msg.clientMsgId === clientMsgId) {
                this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                if (isResponse(msg)) {
                    setImmediate(() => this.socket.emit("PROTO_OA_VERSION_RES", msg.payload));
                    setImmediate(() => cb(msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }
}