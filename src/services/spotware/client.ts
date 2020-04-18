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

function toError(msg: $.ProtoMessage50 | $.ProtoMessage2142): Error {
    const { errorCode, description } = msg.payload;
    return new Error(`${errorCode}, ${description}`);
}

function testResponse<T extends $.ProtoMessages>(payloadType: T["payloadType"]) {
    return (msg: $.ProtoMessages): msg is T => {
        return msg.payloadType === payloadType;
    }
}

interface SpotwareClientProps {
    host: string,
    port: number
}
export class SpotwareClient extends EventEmitter {
    private readonly socket: $.SpotwareSocket;
    private readonly log: debug.Debugger;
    private readonly messages: $.ProtoMessages[] = [];

    constructor(props: SpotwareClientProps) {
        super();
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
        this.mirrorIO();
        this.endOnError();
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
        this.socket.on("close", () => {if(pacemaker) clearTimeout(pacemaker)});
    }

    private mirrorIO() {
        this.socket.on("PROTO_MESSAGE.INPUT.*", msg => {
            const event = $.ProtoOAPayloadType[msg.payloadType] || $.ProtoPayloadType[msg.payloadType]
            setImmediate(() => this.emit(event, msg.payload));
            if (isError(msg) || isOAError(msg)) {
                setImmediate(() => this.emit("error", toError(msg)));
            }
        });
        this.socket.on("PROTO_MESSAGE.OUTPUT.*", msg => {
            const event = $.ProtoOAPayloadType[msg.payloadType] || $.ProtoPayloadType[msg.payloadType]
            setImmediate(() => this.emit(event, msg.payload));
        });
    }

    private endOnError() {
        this.socket.on("error", () => this.socket.end());
    }

    private async awaitResponse<T extends $.ProtoMessages>(clientMsgId: string, isResponse: (msg: $.ProtoMessages) => msg is T): Promise<T["payload"]> {
        return new Promise((resolve, reject) => {
            const response = (msg: $.ProtoMessages) => {
                if (msg.clientMsgId === clientMsgId) {
                    this.socket.off("PROTO_MESSAGE.INPUT.*", response);
                    if (isResponse(msg)) {
                        resolve(msg.payload)
                    } else if (isError(msg) || isOAError(msg)) {
                        reject(toError(msg));
                    }
                }
            }
            this.socket.on("PROTO_MESSAGE.INPUT.*", response);
        })
    }

    accountAuth(payload: $.ProtoOAAccountAuthReq): Promise<$.ProtoOAAccountAuthRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2103>($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    accountLogout(payload: $.ProtoOAAccountLogoutReq): Promise<$.ProtoOAAccountLogoutRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2163>($.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    applicationAuth(payload: $.ProtoOAApplicationAuthReq): Promise<$.ProtoOAApplicationAuthRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2101>($.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES);
        return this.awaitResponse(clientMsgId, isResponse);
    }

    assetClassList(payload: $.ProtoOAAssetClassListReq): Promise<$.ProtoOAAssetClassListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2154>($.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    assetList(payload: $.ProtoOAAssetListReq): Promise<$.ProtoOAAssetListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2113>($.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    cashFlowHistoryList(payload: $.ProtoOACashFlowHistoryListReq): Promise<$.ProtoOACashFlowHistoryListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2144>($.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    dealList(payload: $.ProtoOADealListReq): Promise<$.ProtoOADealListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2134>($.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    expectedMargin(payload: $.ProtoOAExpectedMarginReq): Promise<$.ProtoOAExpectedMarginRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2140>($.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    getAccountListByAccessToken(payload: $.ProtoOAGetAccountListByAccessTokenReq): Promise<$.ProtoOAGetAccountListByAccessTokenRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2150>($.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    getCtidProfileByToken(payload: $.ProtoOAGetCtidProfileByTokenReq): Promise<$.ProtoOAGetCtidProfileByTokenRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2152>($.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    getTickData(payload: $.ProtoOAGetTickDataReq): Promise<$.ProtoOAGetTickDataRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2146>($.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    getTrendbars(payload: $.ProtoOAGetTrendbarsReq): Promise<$.ProtoOAGetTrendbarsRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2138>($.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    marginCallList(payload: $.ProtoOAMarginCallListReq): Promise<$.ProtoOAMarginCallListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2168>($.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    marginCallUpdate(payload: $.ProtoOAMarginCallUpdateReq): Promise<$.ProtoOAMarginCallUpdateRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2170>($.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    reconcile(payload: $.ProtoOAReconcileReq): Promise<$.ProtoOAReconcileRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_RECONCILE_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2125>($.ProtoOAPayloadType.PROTO_OA_RECONCILE_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    refreshToken(payload: $.ProtoOARefreshTokenReq): Promise<$.ProtoOARefreshTokenRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2174>($.ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    subscribeDepthQuotes(payload: $.ProtoOASubscribeDepthQuotesReq): Promise<$.ProtoOASubscribeDepthQuotesRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2157>($.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    subscribeLiveTrendbar(payload: $.ProtoOASubscribeLiveTrendbarReq): Promise<$.ProtoOASubscribeLiveTrendbarRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2165>($.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    subscribeSpots(payload: $.ProtoOASubscribeSpotsReq): Promise<$.ProtoOASubscribeSpotsRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2128>($.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    symbolById(payload: $.ProtoOASymbolByIdReq): Promise<$.ProtoOASymbolByIdRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2117>($.ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    symbolCategoryList(payload: $.ProtoOASymbolCategoryListReq): Promise<$.ProtoOASymbolCategoryListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2161>($.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    symbolsForConversion(payload: $.ProtoOASymbolsForConversionReq): Promise<$.ProtoOASymbolsForConversionRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2119>($.ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    symbolsList(payload: $.ProtoOASymbolsListReq): Promise<$.ProtoOASymbolsListRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2115>($.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    trader(payload: $.ProtoOATraderReq): Promise<$.ProtoOATraderRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2122>($.ProtoOAPayloadType.PROTO_OA_TRADER_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    unsubscribeDepthQuotes(payload: $.ProtoOAUnsubscribeDepthQuotesReq): Promise<$.ProtoOAUnsubscribeDepthQuotesRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2159>($.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    unsubscribeLiveTrendbar(payload: $.ProtoOAUnsubscribeLiveTrendbarReq): Promise<$.ProtoOAUnsubscribeLiveTrendbarRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2166>($.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    unsubscribeSpots(payload: $.ProtoOAUnsubscribeSpotsReq): Promise<$.ProtoOAUnsubscribeSpotsRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2130>($.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    version(payload: $.ProtoOAVersionReq): Promise<$.ProtoOAVersionRes> {
        const clientMsgId = v4()
        this.publish({ payloadType: $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ, payload, clientMsgId })
        const isResponse = testResponse<$.ProtoMessage2105>($.ProtoOAPayloadType.PROTO_OA_VERSION_RES)
        return this.awaitResponse(clientMsgId, isResponse);
    }

    // TODO:
    // PROTO_OA_NEW_ORDER_REQ = 2106,
    // PROTO_OA_TRAILING_SL_CHANGED_EVENT = 2107,
    // PROTO_OA_CANCEL_ORDER_REQ = 2108,
    // PROTO_OA_AMEND_ORDER_REQ = 2109,
    // PROTO_OA_AMEND_POSITION_SLTP_REQ = 2110,
    // PROTO_OA_CLOSE_POSITION_REQ = 2111,
    // PROTO_OA_SYMBOL_CHANGED_EVENT = 2120,
    // PROTO_OA_TRADER_UPDATE_EVENT = 2123,
    // PROTO_OA_EXECUTION_EVENT = 2126,
    // PROTO_OA_SPOT_EVENT = 2131,
    // PROTO_OA_ORDER_ERROR_EVENT
    // PROTO_OA_MARGIN_CHANGED_EVENT
    // PROTO_OA_ERROR_RES
    // PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT
    // PROTO_OA_CLIENT_DISCONNECT_EVENT
    // PROTO_OA_DEPTH_EVENT,
    // PROTO_OA_ACCOUNT_DISCONNECT_EVENT
    // PROTO_OA_MARGIN_CALL_UPDATE_EVENT = 2171,
    // PROTO_OA_MARGIN_CALL_TRIGGER_EVENT = 2172,

    end() {
        this.socket.end();
    }
}