import assert from "assert";
import * as OS from "../base/order"
import * as B from "../base"

class LocalOrderStream<Props extends OS.OrderProps> extends OS.DebugOrderStream<Props> {
    private timestamp: B.Timestamp = 0;

    push(event: OS.OrderEvent | null): boolean {
        if(event) {
            this.timestamp = event.timestamp;
        }
        return super.push(event)
    }

    async close(): Promise<void> {
        const profitLossEvent = this.profitLossOrNull();
        if(profitLossEvent) {
            const { timestamp, price: exit, profitLoss } = profitLossEvent;
            this.tryClose({ timestamp, exit, profitLoss })
            if (this.state.matches("closed")) {
                return;
            }
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.state)})`);
    }
    async cancel(): Promise<void> {
        this.tryCancel({ timestamp: this.timestamp })
        if (this.state.matches("canceled")) {
            return;
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.state)})`);
    }
    async end(): Promise<void> {
        if (["created", "accepted"].includes(this.state.value)) {
            await this.cancel();
        } else if (["filled"].includes(this.state.value)) {
            await this.close();
        }
    }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.AskPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "BUY");
    const fill = (e: B.AskPriceChangedEvent | null): void => {
        if(!e) {
            return;
        }
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        setImmediate(() => { // <-- enables cancelling of market orders
            if (condition(e)) {
                const { timestamp, ask: entry } = e;
                stream.tryFill({ timestamp, entry })
                update(
                    { type: "FILLED", timestamp, entry },
                    spots.bidOrNull()
                )
            }
        })
    }
    const update = (filled: B.OrderFilledEvent, e: B.BidPriceChangedEvent | null): void => {
        if(!e) {
            return;
        }
        const { timestamp, bid: price } = e
        const profitLoss = Math.round((price - filled.entry!) * stream.props.volume * 100) / 100;
        stream.tryProfitLoss({ timestamp, price, profitLoss });

        if (props.stopLoss && props.stopLoss >= price ||
            props.takeProfit && props.takeProfit <= price) {
            stream.tryClose({ timestamp, exit: price, profitLoss })
        }
    }
    const stream = new LocalOrderStream<Props>(props);
    fill(spots.askOrNull());
    spots.on("data", e => {
        const filled = stream.filledOrNull();
        if(filled === null && e.type ==="ASK_PRICE_CHANGED") {
            fill(e);
        } else if(filled !== null && e.type === "BID_PRICE_CHANGED") {
            update(filled, e);
        }
    })
    return stream;
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.BidPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "SELL");
    const fill = (e: B.BidPriceChangedEvent | null): void => {
        if(!e) {
            return;
        }
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        setImmediate(() => { // <-- enables cancelling of market orders
            if (condition(e)) {
                const { timestamp, bid: entry } = e;
                stream.tryFill({ timestamp, entry })
                update(
                    { type: "FILLED", timestamp, entry },
                    spots.askOrNull()
                )
            }
        })
    }
    const update = (filled: B.OrderFilledEvent, e: B.AskPriceChangedEvent | null): void => {
        if(!e) {
            return;
        }
        const { timestamp, ask: price } = e
        const profitLoss = Math.round((filled.entry - price) * stream.props.volume * 100) / 100;
        stream.tryProfitLoss({ timestamp, price, profitLoss });

        if (props.stopLoss && props.stopLoss <= price ||
            props.takeProfit && props.takeProfit >= price) {
            stream.tryClose({ timestamp, exit: price, profitLoss })
        }
    }
    const stream = new LocalOrderStream<Props>(props);
    fill(spots.bidOrNull());
    spots.on("data", e => {
        const filled = stream.filledOrNull()
        if(filled === null && e.type ==="BID_PRICE_CHANGED") {
            fill(e);
        } else if(filled !== null && e.type === "ASK_PRICE_CHANGED") {
            update(filled, e);
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
