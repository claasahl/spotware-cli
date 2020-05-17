import assert from "assert";
import * as OS from "../base/order"
import * as B from "../base"
import { AskPriceChangedEvent } from "../base";

class LocalOrderStream<Props extends OS.OrderProps> extends OS.DebugOrderStream<Props> {
    private timestamp: B.Timestamp = 0;

    push(event: OS.OrderEvent | null): boolean {
        if(event) {
            this.timestamp = event.timestamp;
        }
        return super.push(event)
    }

    async close(): Promise<OS.OrderClosedEvent> {
        const { timestamp, price: exit, profitLoss } = await this.profitLoss();
        this.tryClose({ timestamp, exit, profitLoss })
        if (this.state.matches("closed")) {
            return this.closed()
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.state)})`);
    }
    async cancel(): Promise<OS.OrderCanceledEvent> {
        this.tryCancel({ timestamp: this.timestamp })
        if (this.state.matches("canceled")) {
            return this.canceled();
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.state)})`);
    }
    async end(): Promise<OS.OrderEndedEvent> {
        if (["created", "accepted", "canceled"].includes(this.state.value)) {
            await this.cancel();
        } else if (["filled", "closed"].includes(this.state.value)) {
            await this.close();
        }
        return this.ended()
    }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.AskPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "BUY");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: AskPriceChangedEvent) => {
        if (condition(e)) {
            spots.off("ask", fill);
            const { timestamp, ask: entry } = e;
            stream.tryFill({ timestamp, entry })

            const update = (e: B.BidPriceChangedEvent) => {
                const { timestamp, bid: price } = e
                const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                stream.tryProfitLoss({ timestamp, price, profitLoss });

                if (props.stopLoss && props.stopLoss >= price ||
                    props.takeProfit && props.takeProfit <= price) {
                    spots.off("bid", update);
                    stream.tryClose({ timestamp, exit: price, profitLoss })
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
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        if (!fill(e)) {
            spots.on("ask", fill);
        }
    })
    return stream;
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.BidPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "SELL");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: B.BidPriceChangedEvent) => {
        if (condition(e)) {
            spots.off("bid", fill);
            const { timestamp, bid: entry } = e;
            stream.tryFill({ timestamp, entry })

            const update = (e: B.AskPriceChangedEvent) => {
                const { timestamp, ask: price } = e
                const profitLoss = Math.round((entry - price) * stream.props.volume * 100) / 100;
                stream.tryProfitLoss({ timestamp, price, profitLoss });

                if (props.stopLoss && props.stopLoss <= price ||
                    props.takeProfit && props.takeProfit >= price) {
                    spots.off("ask", update);
                    stream.tryClose({ timestamp, exit: price, profitLoss })
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
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        if (!fill(e)) {
            spots.on("bid", fill);
        }
    })
    return stream;
}

export function marketOrderFromSpotPrices(props: Omit<B.MarketOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OS.OrderStream<B.MarketOrderProps>> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "MARKET" }, spots, () => true)
    }
    return sell({ ...rest, orderType: "MARKET" }, spots, () => true)
}

export function stopOrderFromSpotPrices(props: Omit<B.StopOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OS.OrderStream<B.StopOrderProps>> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "STOP" }, spots, e => e.ask >= props.enter)
    }
    return sell({ ...rest, orderType: "STOP" }, spots, e => e.bid <= props.enter)
}
