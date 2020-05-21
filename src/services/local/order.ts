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
    const fill = (e: B.AskPriceChangedEvent | null): B.Price | null => {
        if(!e) {
            return null;
        }
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        if (condition(e)) {
            const { timestamp, ask: entry } = e;
            stream.tryFill({ timestamp, entry })
            update(entry, spots.bidOrNull())
            return entry;
        }
        return null;
    }
    const update = (entry: B.Price, e: B.BidPriceChangedEvent | null) => {
        if(!e) {
            return;
        }
        const { timestamp, bid: price } = e
        const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
        stream.tryProfitLoss({ timestamp, price, profitLoss });

        if (props.stopLoss && props.stopLoss >= price ||
            props.takeProfit && props.takeProfit <= price) {
            stream.tryClose({ timestamp, exit: price, profitLoss })
        }
    }
    const stream = new LocalOrderStream<Props>(props);
    let entry = fill(spots.askOrNull());
    spots.on("data", e => {
        if(entry === null && e.type ==="ASK_PRICE_CHANGED") {
            entry = fill(e);
        } else if(entry !== null && e.type === "BID_PRICE_CHANGED") {
            update(entry, e);   
        }
    })
    return stream;
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.BidPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "SELL");
    const fill = (e: B.BidPriceChangedEvent | null): B.Price | null => {
        if(!e) {
            return  null;
        }
        const { timestamp } = e;
        stream.tryCreate({ timestamp })
        stream.tryAccept({ timestamp })
        if (condition(e)) {
            const { timestamp, bid: entry } = e;
            stream.tryFill({ timestamp, entry })
            update(entry, spots.askOrNull())
            return entry;
        }
        return null;
    }
    const update = (entry: B.Price, e: B.AskPriceChangedEvent | null) => {
        if(!e) {
            return;
        }
        const { timestamp, ask: price } = e
        const profitLoss = Math.round((entry - price) * stream.props.volume * 100) / 100;
        stream.tryProfitLoss({ timestamp, price, profitLoss });

        if (props.stopLoss && props.stopLoss <= price ||
            props.takeProfit && props.takeProfit >= price) {
            stream.tryClose({ timestamp, exit: price, profitLoss })
        }
    }
    const stream = new LocalOrderStream<Props>(props);
    let entry = fill(spots.bidOrNull());
    spots.on("data", e => {
        if(entry === null && e.type ==="BID_PRICE_CHANGED") {
            entry = fill(e);
        } else if(entry !== null && e.type === "ASK_PRICE_CHANGED") {
            update(entry, e);
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
