import * as $ from "@claasahl/spotware-adapter"
import {Readable, finished} from "stream";
import debug from "debug";

import * as T from "../types"
import { SpotwareClient } from "./client";
import {logOrderEvents} from "../logging"

class SpotwareOrderStream<Props extends T.OrderProps> extends Readable implements T.OrderStream<Props> {
    readonly props: Props;
    private readonly lifecyle = T.lifecycle();
    private readonly client: SpotwareClient;
    ctidTraderAccountId?: number;
    lotSize?: number;
    positionId?: number;
    orderId?: number;

    constructor(props: Props, client: SpotwareClient) {
        super({objectMode: true, read: () => {}});
        this.props = Object.freeze(props);
        this.client = client;
        logOrderEvents(this);
    }
    
    push(chunk: T.OrderEvent | null, encoding?: BufferEncoding): boolean {
        if (chunk && !this.lifecyle.test(chunk)) {
            return true;
        }
        if(chunk) {
            this.lifecyle.update(chunk);
        }
        return super.push(chunk, encoding);
    }

    closeOrder(): void {
        if(this.lotSize && this.ctidTraderAccountId && this.positionId && this.lifecyle.test({type: "CLOSED"})) {
            this.client.closePosition({
                ctidTraderAccountId: this.ctidTraderAccountId,
                positionId: this.positionId,
                volume: this.props.volume * this.lotSize
            }).catch(err => this.destroy(err))
            return;
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.lifecyle.state)};${this.lotSize};${this.ctidTraderAccountId};${this.positionId})`);
    }

    cancelOrder(): void {
        if(this.ctidTraderAccountId && this.orderId && this.lifecyle.test({type: "CANCELED"})) {
            this.client.cancelOrder({
                ctidTraderAccountId: this.ctidTraderAccountId,
                orderId: this.orderId
            }).catch(err => this.destroy(err))
            return;
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.lifecyle.state)};${this.ctidTraderAccountId};${this.orderId})`);
    }
    
    endOrder(): void {
        if(this.lifecyle.test({type: "CANCELED"})) {
            this.cancelOrder();
        } else if(this.lifecyle.test({type: "CLOSED"})) {
            this.closeOrder();
        }
    }
}

function order<Props extends T.OrderProps>(props: Props, extras: { client: SpotwareClient, spots: T.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol>, partial: Partial<$.ProtoOANewOrderReq> & Pick<$.ProtoOANewOrderReq, "orderType"> }): T.OrderStream<Props> {
    const stream = new SpotwareOrderStream(props, extras.client);
    setImmediate(async () => {
        try {
            const ctidTraderAccountId = await extras.ctidTraderAccountId();
            const {symbolId, lotSize = 1, digits } = await extras.spotwareSymbol();
            const tradeSide = (() => {
                switch (props.tradeSide) {
                    case "SELL":
                        return $.ProtoOATradeSide.SELL
                    case "BUY":
                    default:
                        return $.ProtoOATradeSide.BUY
                }
            })();
            const event = await extras.client.newOrder({
                ...extras.partial,
                ctidTraderAccountId,
                symbolId,
                tradeSide,
                volume: props.volume * lotSize,
                takeProfit: props.takeProfit,
                stopLoss: props.stopLoss,
                expirationTimestamp: props.expiresAt
            })
            stream.ctidTraderAccountId = ctidTraderAccountId;
            stream.positionId = event.order?.positionId || 0;
            stream.orderId = event.order?.orderId || 0;
            stream.lotSize = lotSize;
            stream.push({ type: "CREATED", timestamp: Date.now() })
            
            const round = (price: number) => {
                const factor = Math.pow(10, digits);
                return Math.round(price * factor) / factor
            }
            extras.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
                switch (msg.executionType) {
                    case $.ProtoOAExecutionType.ORDER_ACCEPTED:
                        {
                            if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                                return
                            }
                            if (msg.order.closingOrder) {
                                const modifiedStopLoss = Math.abs((msg.order.limitPrice || 0) - (props.stopLoss || 0)) > 0.001
                                const modifiedTakeProfit = Math.abs((msg.order.takeProfit || 0) - (props.takeProfit || 0)) > 0.001

                                const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                                const data = {
                                    type:"COMMENT",
                                    timestamp,
                                    spotware: {
                                        limitPrice: msg.order.limitPrice,
                                        takeProfit: msg.order.takeProfit
                                    },
                                    expected: {
                                        stopLoss: props.stopLoss,
                                        takeProfit: props.takeProfit
                                    },
                                    modifiedStopLoss,
                                    modifiedTakeProfit
                                };
                                debug("order")
                                    .extend(stream.props.symbol.toString())
                                    .extend(stream.props.id)("%j", data);
                                debug("account")("%j", data);
                                return;
                            }
                            const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                            stream.push({ type: "ACCEPTED", timestamp });
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_EXPIRED:
                        {
                            if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                                return
                            }
                            const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                            stream.push({ type: "EXPIRED", timestamp });
                            stream.push(null);
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_CANCELLED:
                        {
                            if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                                return
                            }
                            const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                            stream.push({ type: "CANCELED", timestamp });
                            stream.push(null);
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_FILLED:
                        {
                            if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
                                return
                            }
                            const executionPrice = msg.deal.executionPrice || 0;
                            const timestamp = msg.deal.executionTimestamp;
                            if (msg.deal.closePositionDetail) {
                                const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, digits);
                                stream.push({ type: "CLOSED", timestamp, exit: executionPrice, profitLoss });
                                stream.push(null);
                                break;
                            }

                            stream.push({ type: "FILLED", timestamp, entry: executionPrice });
                            if (props.tradeSide === "BUY") {
                                const update = (e: T.SpotPricesEvent) => {
                                    if (e.type === "BID_PRICE_CHANGED") {
                                        const { timestamp, bid: price } = e
                                        const profitLoss = round((price - executionPrice) * stream.props.volume);
                                        stream.push({ type: "PROFITLOSS", timestamp, price, profitLoss })
                                    }
                                }
                                extras.spots.on("data", update);
                                const cleanup = finished(stream, () => {
                                    cleanup();
                                    extras.spots.off("data", update)
                                })
                            } else if (props.tradeSide === "SELL") {
                                const update = (e: T.SpotPricesEvent) => {
                                    if (e.type === "ASK_PRICE_CHANGED") {
                                        const { timestamp, ask: price } = e
                                        const profitLoss = round((executionPrice - price) * stream.props.volume);
                                        stream.push({ type: "PROFITLOSS", timestamp, price, profitLoss })
                                    }
                                }
                                extras.spots.on("data", update);
                                const cleanup = finished(stream, () => {
                                    cleanup();
                                    extras.spots.off("data", update)
                                })
                            }
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_REJECTED:
                        {
                            if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
                                return
                            }
                            const timestamp = msg.deal.executionTimestamp;
                            stream.push({ type: "REJECTED", timestamp, message: msg.errorCode });
                            stream.push(null);
                            break;
                        }
                    default:
                        const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                        stream.destroy(error);
                }
            });
            extras.client.on("error", err => stream.destroy(err))
        } catch (error) {
            stream.destroy(error)
        }
    })
    return stream;
}

export function marketOrder(props: Omit<T.MarketOrderProps & { client: SpotwareClient, spots: T.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol> }, "orderType">): T.OrderStream<T.MarketOrderProps> {
    const { client, spots, ctidTraderAccountId, spotwareSymbol, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, spotwareSymbol }
    const partial = { orderType: $.ProtoOAOrderType.MARKET }
    return order({ ...rest, orderType: "MARKET"}, {...extras, partial })
}
export function stopOrder(props: Omit<T.StopOrderProps & { client: SpotwareClient, spots: T.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol> }, "orderType">): T.OrderStream<T.StopOrderProps> {
    const { client, spots, ctidTraderAccountId, spotwareSymbol, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, spotwareSymbol }
    const partial = { orderType: $.ProtoOAOrderType.STOP, stopPrice: props.enter }
    return order({ ...rest, orderType: "STOP"}, {...extras, partial })
}