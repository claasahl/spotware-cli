import assert from "assert";
import {OrderStream, OrderProps, OrderClosedEvent, OrderCanceledEvent, OrderExpiredEvent} from "../base/orderStream"
import * as B from "../base"
import { AskPriceChangedEvent } from "../base";

class LocalOrderStream<Props extends OrderProps> extends OrderStream<Props> {
    close(): Promise<OrderClosedEvent> {
        throw new Error("Method not implemented.");
    }
    cancel(): Promise<OrderCanceledEvent> {
        throw new Error("Method not implemented.");
    }
    end(): Promise<OrderClosedEvent | OrderCanceledEvent | OrderExpiredEvent> {
        throw new Error("Method not implemented.");
    }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.AskPriceChangedEvent) => boolean): Promise<OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "BUY");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: AskPriceChangedEvent) => {
        if(condition(e)) {
            spots.off("ask", fill);
            const {timestamp, ask: entry} = e;
            stream.push({type: "FILLED", timestamp, entry})

            const update = (e: B.BidPriceChangedEvent) => {
                const {timestamp, bid: price} = e
                const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                stream.push({type: "PROFITLOSS", timestamp, price, profitLoss})

                if(props.stopLoss && props.stopLoss >= price ||
                    props.takeProfit && props.takeProfit <= price) {
                    spots.off("bid", update);
                    stream.push({type: "CLOSED", timestamp, exit: price, profitLoss})
                }
            }
            spots.bid().then(e => {
                update(e);
                spots.on("bid", update)
            })
        }
        return false;
    }
    spots.ask().then(e => {
        const {timestamp} = e;
        stream.push({type: "CREATED", timestamp})
        stream.push({type: "ACCEPTED", timestamp})
        if(!fill(e)) {
            spots.on("ask", fill);
        }
    })
    return stream;
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.BidPriceChangedEvent) => boolean): Promise<OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "SELL");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: B.BidPriceChangedEvent) => {
        if(condition(e)) {
            spots.off("bid", fill);
            const {timestamp, bid: entry} = e;
            stream.push({type: "FILLED", timestamp, entry})

            const update = (e: B.AskPriceChangedEvent) => {
                const {timestamp, ask: price} = e
                const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                stream.push({type: "PROFITLOSS", timestamp, price, profitLoss})

                if(props.stopLoss && props.stopLoss >= price ||
                    props.takeProfit && props.takeProfit <= price) {
                    spots.off("ask", update);
                    stream.push({type: "CLOSED", timestamp, exit: price, profitLoss})
                }
            }
            spots.ask().then(e => {
                update(e);
                spots.on("ask", update)
            })
        }
        return false;
    }
    spots.bid().then(e => {
        const {timestamp} = e;
        stream.push({type: "CREATED", timestamp})
        stream.push({type: "ACCEPTED", timestamp})
        if(!fill(e)) {
            spots.on("bid", fill);
        }
    })
    return stream;
}

export function marketOrderFromSpotPrices(props: Omit<B.MarketOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OrderStream<B.MarketOrderProps>> {
    const {spots, ...rest} = props;
    if(props.tradeSide === "BUY") {
        return buy({...rest, orderType: "MARKET"}, spots, () => true)
    }
    return sell({...rest, orderType: "MARKET"}, spots, () => true)
}

export function stopOrderFromSpotPrices(props: Omit<B.StopOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OrderStream<B.StopOrderProps>> {
    const {spots, ...rest} = props;
    if(props.tradeSide === "BUY") {
        return buy({...rest, orderType: "STOP"}, spots, e => e.ask >= props.enter)
    }
    return sell({...rest, orderType: "STOP"}, spots, e => e.bid <= props.enter)
}
