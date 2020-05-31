import assert from "assert";
import { Transform, TransformCallback, pipeline } from "stream";
import debug from "debug";

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

    async closeOrder(): Promise<void> {
        if ("closed" === this.state.value) {
            return;
        } else if ("filled" === this.state.value) {
            const { timestamp, price: exit, profitLoss } = await new Promise(resolve => {
                const profitLossEvent = this.profitLossOrNull();
                if(profitLossEvent) {
                    return resolve(profitLossEvent);
                }
                const listener = (e: B.OrderEvent) => {
                    if(e.type === "PROFITLOSS") {
                        resolve(e);
                        this.off("data", listener);
                    }
                } 
                this.on("data", listener);
            })
            this.tryClose({ timestamp, exit, profitLoss })
            if (this.state.matches("closed")) {
                return;
            }
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.state)})`);
    }
    async cancelOrder(): Promise<void> {
        if ("canceled" === this.state.value) {
            return;
        } else if (["created", "accepted"].includes(this.state.value)) {
            this.tryCancel({ timestamp: this.timestamp })
            if (this.state.matches("canceled")) {
                return;
            }
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.state)})`);
    }
    async endOrder(): Promise<void> {
        if (["created", "accepted"].includes(this.state.value)) {
            await this.cancelOrder();
        } else if (["filled"].includes(this.state.value)) {
            await this.closeOrder();
        }
    }
}

type Condition = (e: B.SpotPricesEvent) => boolean;

class ToBuyOrder<Props extends B.OrderProps> extends Transform implements B.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private readonly log: debug.Debugger;
    private bidPrice: B.BidPriceChangedEvent | null = null;
    private filled: B.OrderFilledEvent | null = null;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      this.log = debug("order").extend(props.id);
    }
    closeOrder(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    cancelOrder(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    endOrder(): Promise<void> {
        throw new Error("Method not implemented.");
    }
  
    push(event: B.OrderEvent | null): boolean {
      if (event) {
        this.log("%j", event);
      }
      return super.push(event)
    }

    _transform(chunk: B.SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
        if(this.filled === null && chunk.type ==="ASK_PRICE_CHANGED") {
            this.tryToFillOrder(chunk);
        } else if(this.filled === null && chunk.type === "BID_PRICE_CHANGED") {
            this.bidPrice = chunk;
        } else if(this.filled !== null && chunk.type === "BID_PRICE_CHANGED") {
            this.tryToCloseOrder(chunk, this.filled);
        }
        callback();
    }

    private tryToFillOrder(e: B.AskPriceChangedEvent) {
        const { timestamp } = e;
        this.push({ type: "CREATED", timestamp })
        this.push({ type: "ACCEPTED", timestamp })
        if (this.entryCondition(e)) {
            const { timestamp, ask: entry } = e;
            this.filled = { type: "FILLED", timestamp, entry }
            this.push({ type: "FILLED", timestamp, entry })
            if(this.bidPrice) {
                this.tryToCloseOrder(this.bidPrice, this.filled);
                this.bidPrice = null; // just needed for faster profitLoss / close events
            }
        }
    }

    private tryToCloseOrder(e: B.BidPriceChangedEvent, filled: B.OrderFilledEvent) {
        const { timestamp, bid: price } = e
        const profitLoss = Math.round((price - filled.entry!) * this.props.volume * 100) / 100;
        this.push({ type: "PROFITLOSS", timestamp, price, profitLoss });

        if (this.exitCondition(e)) {
            this.push({ type: "CLOSED", timestamp, exit: price, profitLoss })
            this.push({ type: "ENDED", timestamp, exit: price, profitLoss })
            this.push(null)
        }
    }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, entryCondition: Condition): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "BUY");
    const exitCondition: Condition = e => {
        if(e.type !== "BID_PRICE_CHANGED") {
            return false;
        } else if(props.stopLoss) {
            return props.stopLoss >= e.bid;
        } else if(props.takeProfit) {
            return props.takeProfit <= e.bid;
        }
        return false;
    }
    return pipeline(
        spots,
        new ToBuyOrder(props, entryCondition, exitCondition),
        err => console.log("pipeline callback", err)
      );
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
        return buy({ ...rest, orderType: "STOP" }, spots, e => e.type === "ASK_PRICE_CHANGED" && e.ask >= props.enter)
    }
    return sell({ ...rest, orderType: "STOP" }, spots, e => e.bid <= props.enter)
}
