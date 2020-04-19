import * as $ from "@claasahl/spotware-adapter"
import * as B from "../base"
import { SpotwareClient } from "./client";

export async function marketOrder(props: Omit<B.MarketOrderProps & {client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, details: $.ProtoOASymbol  }, "orderType">): Promise<B.OrderStream<B.MarketOrderProps>> {
    const { ctidTraderAccountId, symbolId, details } = props;
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
        ctidTraderAccountId,
        orderType: $.ProtoOAOrderType.MARKET,
        symbolId,
        tradeSide,
        volume: props.volume * (details.lotSize || 1),
        takeProfit: props.takeProfit,
        stopLoss: props.stopLoss
    })
    const stream = new B.DebugOrderStream({ ...props, orderType: "MARKET" });
    stream.emitCreated({ timestamp: Date.now() })
    const round = (price: number) => {
        const factor = Math.pow(10, details.digits);
        return Math.round(price * factor) / factor
    }
    props.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
        if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
            return
        }
        const timestamp = Date.now();
        switch (msg.executionType) {
            case $.ProtoOAExecutionType.ORDER_ACCEPTED:
                stream.emitAccepted({ timestamp });
                break;
            case $.ProtoOAExecutionType.ORDER_EXPIRED:
            case $.ProtoOAExecutionType.ORDER_CANCELLED:
                stream.emitCanceled({ timestamp });
                break;
            case $.ProtoOAExecutionType.ORDER_FILLED:
                const executionPrice = msg.deal.executionPrice || 0;
                if (msg.deal.closePositionDetail) {
                    const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, details.digits);
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
            case $.ProtoOAExecutionType.ORDER_REJECTED:
                stream.emitRejected({ timestamp });
                break;
            default:
                const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                console.log(error)
                setImmediate(() => stream.emit("error", error))
        }
    })
    return stream;
}
export async function stopOrder(props: Omit<B.StopOrderProps & {client: SpotwareClient, spots: B.SpotPricesStream, ctidTraderAccountId: number, symbolId: number, details: $.ProtoOASymbol  }, "orderType">): Promise<B.OrderStream<B.StopOrderProps>> {
    const { ctidTraderAccountId, symbolId, details } = props;
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
        ctidTraderAccountId,
        orderType: $.ProtoOAOrderType.MARKET,
        symbolId,
        tradeSide,
        volume: props.volume * (details.lotSize || 1),
        takeProfit: props.takeProfit,
        stopLoss: props.stopLoss,
        stopPrice: props.enter
    })
    const stream = new B.DebugOrderStream({ ...props, orderType: "STOP" });
    stream.emitCreated({ timestamp: Date.now() })
    const round = (price: number) => {
        const factor = Math.pow(10, details.digits);
        return Math.round(price * factor) / factor
    }
    props.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
        if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
            return
        }
        const timestamp = Date.now();
        switch (msg.executionType) {
            case $.ProtoOAExecutionType.ORDER_ACCEPTED:
                stream.emitAccepted({ timestamp });
                break;
            case $.ProtoOAExecutionType.ORDER_EXPIRED:
            case $.ProtoOAExecutionType.ORDER_CANCELLED:
                stream.emitCanceled({ timestamp });
                break;
            case $.ProtoOAExecutionType.ORDER_FILLED:
                const executionPrice = msg.deal.executionPrice || 0;
                if (msg.deal.closePositionDetail) {
                    const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, details.digits);
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
            case $.ProtoOAExecutionType.ORDER_REJECTED:
                stream.emitRejected({ timestamp });
                break;
            default:
                const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                console.log(error)
                setImmediate(() => stream.emit("error", error))
        }
    })
    return stream;
}