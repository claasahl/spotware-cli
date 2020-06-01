import * as $ from "@claasahl/spotware-adapter"
import * as B from "../base"
import { SpotwareClient } from "./client";

class SpotwareOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
    private readonly client: SpotwareClient;
    private readonly ctidTraderAccountId: number;
    private readonly lotSize: number;
    private readonly positionId: number;
    private readonly orderId: number;

    constructor(props: Props, extras: { client: SpotwareClient, ctidTraderAccountId: number, lotSize: number, positionId: number, orderId: number }) {
        super(props);
        this.client = extras.client;
        this.ctidTraderAccountId = extras.ctidTraderAccountId;
        this.lotSize = extras.lotSize;
        this.positionId = extras.positionId;
        this.orderId = extras.orderId;
    }

    closeOrder(): void {
        if (["filled"].includes(this.state.value)) {
            const ctidTraderAccountId = this.ctidTraderAccountId;
            const positionId = this.positionId;
            const volume = this.props.volume * this.lotSize;
            this.client.closePosition({ctidTraderAccountId, positionId, volume})
            return;
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.state)})`);
    }

    cancelOrder(): void {
        if (["created", "accepted"].includes(this.state.value)) {
            const ctidTraderAccountId = this.ctidTraderAccountId;
            const orderId = this.orderId;
            this.client.cancelOrder({ctidTraderAccountId, orderId})
            return;
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.state)})`);
    }
    
    endOrder(): void {
        if (["created", "accepted"].includes(this.state.value)) {
            this.cancelOrder();
        } else if (["filled"].includes(this.state.value)) {
            this.closeOrder();
        }
    }
}

async function order<Props extends B.OrderProps>(props: Props, extras: { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, lotSize: number, digits: number, partial: Partial<$.ProtoOANewOrderReq> & Pick<$.ProtoOANewOrderReq, "orderType"> }): Promise<B.OrderStream<Props>> {
    const { ctidTraderAccountId, symbolId } = extras;
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
        volume: props.volume * extras.lotSize,
        takeProfit: props.takeProfit,
        stopLoss: props.stopLoss,
        expirationTimestamp: props.expiresAt
    })
    const positionId = event.order?.positionId || 0;
    const orderId = event.order?.orderId || 0;
    const stream = new SpotwareOrderStream<Props>(props, {...extras, positionId, orderId});
    stream.tryCreate({ timestamp: Date.now() })
    const round = (price: number) => {
        const factor = Math.pow(10, extras.digits);
        return Math.round(price * factor) / factor
    }
    extras.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
        switch (msg.executionType) {
            case $.ProtoOAExecutionType.ORDER_ACCEPTED:
                {
                    if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                        return
                    }
                    if(msg.order.closingOrder) {
                        return;
                    }
                    const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                    stream.tryAccept({ timestamp });
                    break;
                }
            case $.ProtoOAExecutionType.ORDER_EXPIRED:
                {
                    if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                        return
                    }
                    const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                    stream.tryExpire({ timestamp });
                    break;
                }
            case $.ProtoOAExecutionType.ORDER_CANCELLED:
                {
                    if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                        return
                    }
                    const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                    stream.tryCancel({ timestamp });
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
                        const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, extras.digits);
                        stream.tryClose({ timestamp, exit: executionPrice, profitLoss });
                        break;
                    }

                    stream.tryFill({ timestamp, entry: executionPrice });
                    if (props.tradeSide === "BUY") {
                        const update = (e: B.SpotPricesEvent) => {
                            if(e.type === "BID_PRICE_CHANGED") {
                                const { timestamp, bid: price } = e
                                const profitLoss = round((price - executionPrice) * stream.props.volume);
                                stream.tryProfitLoss({ timestamp, price, profitLoss })
                            }
                        }
                        extras.spots.on("data", update);
                        stream.once("end", () => extras.spots.off("data", update))
                    } else if (props.tradeSide === "SELL") {
                        const update = (e: B.SpotPricesEvent) => {
                            if(e.type === "ASK_PRICE_CHANGED") {
                                const { timestamp, ask: price } = e
                                const profitLoss = round((executionPrice - price) * stream.props.volume);
                                stream.tryProfitLoss({ timestamp, price, profitLoss })
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
                    stream.tryReject({ timestamp });
                    break;
                }
            default:
                const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                console.log(error)
                setImmediate(() => stream.emit("error", error))
        }
    })
    return stream;
}

export async function marketOrder(props: Omit<B.MarketOrderProps & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, lotSize: number, digits: number }, "orderType">): Promise<B.OrderStream<B.MarketOrderProps>> {
    const { client, spots, ctidTraderAccountId, symbolId, lotSize, digits, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, symbolId, lotSize, digits }
    const partial = { orderType: $.ProtoOAOrderType.MARKET }
    return order({ ...rest, orderType: "MARKET"}, {...extras, partial })
}
export async function stopOrder(props: Omit<B.StopOrderProps & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, lotSize: number, digits: number }, "orderType">): Promise<B.OrderStream<B.StopOrderProps>> {
    const { client, spots, ctidTraderAccountId, symbolId, lotSize, digits, ...rest} = props;
    const extras = { client, spots, ctidTraderAccountId, symbolId, lotSize, digits }
    const partial = { orderType: $.ProtoOAOrderType.STOP, stopPrice: props.enter }
    return order({ ...rest, orderType: "STOP"}, {...extras, partial })
}