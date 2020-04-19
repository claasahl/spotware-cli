import * as $ from "@claasahl/spotware-adapter"
import * as B from "../base"
import { SpotwareClient } from "./client";

class SpotwareOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
    private readonly client: SpotwareClient;
    private readonly ctidTraderAccountId: number;
    private readonly lotSize: number;
    private readonly positionId: number;
    private readonly orderId: number;
    
    constructor(props: Props & { client: SpotwareClient, ctidTraderAccountId: number, lotSize: number, positionId: number, orderId: number }) {
        super(props);
        this.client = props.client;
        this.ctidTraderAccountId = props.ctidTraderAccountId;
        this.lotSize = props.lotSize;
        this.positionId = props.positionId;
        this.orderId = props.orderId;
    }

    close(): Promise<B.OrderClosedEvent> {
        const ctidTraderAccountId = this.ctidTraderAccountId;
        const positionId = this.positionId;
        const volume = this.props.volume * this.lotSize;
        return new Promise((resolve) => {
            this.client.closePosition({ctidTraderAccountId, positionId, volume})
            this.once("closed", resolve)
        })
    }

    cancel(): Promise<B.OrderCanceledEvent> {
        const ctidTraderAccountId = this.ctidTraderAccountId;
        const orderId = this.orderId;
        return new Promise((resolve) => {
            this.client.cancelOrder({ctidTraderAccountId, orderId})
            this.once("canceled", resolve)
        })
    }

    async end(): Promise<B.OrderEndedEvent> {
        try {
            return await this.close();
        } catch {
            return this.cancel()
        }
    }
    
    amend(): Promise<B.OrderAmendedEvent> {
        throw new Error("not implemented");
    }
}

async function order<Props extends B.OrderProps>(props: Props & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, lotSize: number, digits: number, partial: Partial<$.ProtoOANewOrderReq> & Pick<$.ProtoOANewOrderReq, "orderType"> }): Promise<B.OrderStream<Props>> {
    const { ctidTraderAccountId, symbolId } = props;
    const tradeSide = (() => {
        switch (props.tradeSide) {
            case "SELL":
                return $.ProtoOATradeSide.SELL
            case "BUY":
            default:
                return $.ProtoOATradeSide.BUY
        }
    })();
    const event = await props.client.newOrder({
        ...props.partial,
        ctidTraderAccountId,
        symbolId,
        tradeSide,
        volume: props.volume * props.lotSize,
        takeProfit: props.takeProfit,
        stopLoss: props.stopLoss
    })
    const positionId = event.order?.positionId || 0;
    const orderId = event.order?.orderId || 0;
    const stream = new SpotwareOrderStream<Props>({...props, positionId, orderId});
    stream.emitCreated({ timestamp: Date.now() })
    const round = (price: number) => {
        const factor = Math.pow(10, props.digits);
        return Math.round(price * factor) / factor
    }
    props.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
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
                    stream.emitAccepted({ timestamp });
                    break;
                }
            case $.ProtoOAExecutionType.ORDER_EXPIRED:
            case $.ProtoOAExecutionType.ORDER_CANCELLED:
                {
                    if (!msg.order || !event.position || msg.order.positionId !== event.position.positionId) {
                        return
                    }
                    const timestamp = msg.order.utcLastUpdateTimestamp || 0;
                    stream.emitCanceled({ timestamp });
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
                        const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, props.digits);
                        stream.emitClosed({ timestamp, exit: executionPrice, profitLoss });
                        stream.emitEnded({ timestamp, exit: executionPrice, profitLoss });
                        break;
                    }

                    stream.emitFilled({ timestamp, entry: executionPrice });
                    if (props.tradeSide === "BUY") {
                        const update = (e: B.BidPriceChangedEvent) => {
                            const { timestamp, bid: price } = e
                            const profitLoss = round((price - executionPrice) * stream.props.volume);
                            stream.emitProfitLoss({ timestamp, price, profitLoss })
                        }
                        props.spots.on("bid", update);
                        stream.once("ended", () => props.spots.off("bid", update))
                    } else if (props.tradeSide === "SELL") {
                        const update = (e: B.AskPriceChangedEvent) => {
                            const { timestamp, ask: price } = e
                            const profitLoss = round((executionPrice - price) * stream.props.volume);
                            stream.emitProfitLoss({ timestamp, price, profitLoss })
                        }
                        props.spots.on("ask", update);
                        stream.once("ended", () => props.spots.off("ask", update))
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
                    stream.emitRejected({ timestamp });
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
    return order({ ...props, orderType: "MARKET", partial: {
        orderType: $.ProtoOAOrderType.MARKET
    } })
}
export async function stopOrder(props: Omit<B.StopOrderProps & { client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, lotSize: number, digits: number }, "orderType">): Promise<B.OrderStream<B.StopOrderProps>> {
    return order({
        ...props, orderType: "STOP", partial: {
            orderType: $.ProtoOAOrderType.STOP,
            stopPrice: props.enter
        }
    })
}