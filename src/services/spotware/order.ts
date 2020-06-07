import * as $ from "@claasahl/spotware-adapter"
import {Readable} from "stream";

import * as B from "../base"
import { SpotwareClient } from "./client";

class SpotwareOrderStream<Props extends B.OrderProps> extends Readable implements B.OrderStream<Props> {
    readonly props: Props;
    private readonly lifecyle = B.lifecycle();
    private readonly client: SpotwareClient;
    ctidTraderAccountId?: number;
    lotSize?: number;
    positionId?: number;
    orderId?: number;

    constructor(props: Props, client: SpotwareClient) {
        super({objectMode: true, read: () => {}});
        this.props = Object.freeze(props);
        this.client = client;
    }
    
    push(chunk: B.OrderEvent | null, encoding?: BufferEncoding): boolean {
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
            })
            return;
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.lifecyle.state)})`);
    }

    cancelOrder(): void {
        if(this.ctidTraderAccountId && this.orderId && this.lifecyle.test({type: "CANCELED"})) {
            this.client.cancelOrder({
                ctidTraderAccountId: this.ctidTraderAccountId,
                orderId: this.orderId
            })
            return;
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.lifecyle.state)})`);
    }
    
    endOrder(): void {
        if(this.lifecyle.test({type: "CANCELED"})) {
            this.cancelOrder();
        } else if(this.lifecyle.test({type: "CLOSED"})) {
            this.closeOrder();
        }
    }
}

function order<Props extends B.OrderProps>(props: Props, extras: { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol>, partial: Partial<$.ProtoOANewOrderReq> & Pick<$.ProtoOANewOrderReq, "orderType"> }): B.OrderStream<Props> {
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
            stream.positionId = event.order?.positionId || 0;
            stream.orderId = event.order?.orderId || 0;
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
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_CANCELLED:
                        {
                            if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                                return
                            }
                            const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                            stream.push({ type: "CANCELED", timestamp });
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
                                break;
                            }

                            stream.push({ type: "FILLED", timestamp, entry: executionPrice });
                            if (props.tradeSide === "BUY") {
                                const update = (e: B.SpotPricesEvent) => {
                                    if (e.type === "BID_PRICE_CHANGED") {
                                        const { timestamp, bid: price } = e
                                        const profitLoss = round((price - executionPrice) * stream.props.volume);
                                        stream.push({ type: "PROFITLOSS", timestamp, price, profitLoss })
                                    }
                                }
                                extras.spots.on("data", update);
                                stream.once("end", () => extras.spots.off("data", update))
                            } else if (props.tradeSide === "SELL") {
                                const update = (e: B.SpotPricesEvent) => {
                                    if (e.type === "ASK_PRICE_CHANGED") {
                                        const { timestamp, ask: price } = e
                                        const profitLoss = round((executionPrice - price) * stream.props.volume);
                                        stream.push({ type: "PROFITLOSS", timestamp, price, profitLoss })
                                    }
                                }
                                extras.spots.on("data", update);
                                stream.once("end", () => extras.spots.off("data", update))
                            }
                            break;
                        }
                    case $.ProtoOAExecutionType.ORDER_REJECTED:
                        {
                            if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
                                return
                            }
                            const timestamp = msg.deal.executionTimestamp;
                            // TODO: msg.errorCode
                            stream.push({ type: "REJECTED", timestamp });
                            break;
                        }
                    default:
                        const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                        console.log(error)
                        setImmediate(() => stream.emit("error", error))
                }
            });
            extras.client.on("error", err => stream.destroy(err))
        } catch (error) {
            stream.destroy(error)
        }
    })
    return stream;
}

export function marketOrder(props: Omit<B.MarketOrderProps & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol> }, "orderType">): B.OrderStream<B.MarketOrderProps> {
    const { client, spots, ctidTraderAccountId, spotwareSymbol, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, spotwareSymbol }
    const partial = { orderType: $.ProtoOAOrderType.MARKET }
    return order({ ...rest, orderType: "MARKET"}, {...extras, partial })
}
export function stopOrder(props: Omit<B.StopOrderProps & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: () => Promise<number>, spotwareSymbol: () => Promise<$.ProtoOASymbol> }, "orderType">): B.OrderStream<B.StopOrderProps> {
    const { client, spots, ctidTraderAccountId, spotwareSymbol, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, spotwareSymbol }
    const partial = { orderType: $.ProtoOAOrderType.STOP, stopPrice: props.enter }
    return order({ ...rest, orderType: "STOP"}, {...extras, partial })
}