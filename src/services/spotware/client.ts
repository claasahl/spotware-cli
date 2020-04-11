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

interface Callback<T> {
    (err: Error): void
    (err: undefined, payload: T): void
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
                    setImmediate(() => cb(undefined, msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                    setImmediate(() => cb(error));
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
                    setImmediate(() => cb(undefined, msg.payload));
                } else if (isError(msg) || isOAError(msg)) {
                    const { errorCode, description } = msg.payload;
                    const error = new Error(`${errorCode}, ${description}`);
                    setImmediate(() => this.socket.emit("error", error));
                    setImmediate(() => cb(error));
                }
            }
        }
        this.socket.on("PROTO_MESSAGE.INPUT.*", response);
    }
}