import assert from "assert";
import { Transform, TransformCallback, pipeline } from "stream";
import debug from "debug";

import * as OS from "../base/order"
import * as B from "../base"

type Condition = (e: B.SpotPricesEvent) => boolean;

class ToBuyOrder<Props extends B.OrderProps> extends Transform implements B.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private readonly log: debug.Debugger;
    private bidPrice: B.BidPriceChangedEvent | null = null;
    private filled: B.OrderFilledEvent | null = null;
    private profitLoss: B.OrderProfitLossEvent | null = null;
    private lifecyle = B.lifecycle();
    private timestamp: B.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      this.log = debug("order").extend(props.id);
    }

    closeOrder(): void {
      if (this.lifecyle.test({type: "CLOSED" })) {
            new Promise<B.OrderProfitLossEvent>(resolve => {
                if(this.profitLoss) {
                    return resolve(this.profitLoss);
                }
                const listener = (e: B.OrderEvent) => {
                    if(e.type === "PROFITLOSS") {
                        resolve(e);
                        this.off("data", listener);
                    }
                } 
                this.on("data", listener);
            }).then(({ timestamp, price: exit, profitLoss }) => {
              this.push({ type: "CLOSED", timestamp, exit, profitLoss })
              this.push({ type: "ENDED", timestamp, exit, profitLoss })
              this.push(null)
            })
            return;
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.lifecyle.state)})`);
    }

    cancelOrder(): void {
      if (this.lifecyle.test({type: "CANCELED" })) {
        this.push({ type: "CANCELED", timestamp: this.timestamp })
        this.push({ type: "ENDED", timestamp: this.timestamp })
        this.push(null)
        return;
      }
      throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.lifecyle.state)})`);
    }

    endOrder(): void {
        if (this.lifecyle.test({type: "CANCELED" })) {
            this.cancelOrder();
        } else if (this.lifecyle.test({type: "CLOSED" })) {
            this.closeOrder();
        }
    }
  
    push(event: B.OrderEvent | null): boolean {
      if (event && !this.lifecyle.test(event)) {
        return true;
      }
      if (event) {
        this.log("%j", event);
        this.timestamp = event.timestamp;
        this.lifecyle.update(event);
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

    private tryToFillOrder(e: B.AskPriceChangedEvent): void {
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

    private tryToCloseOrder(e: B.BidPriceChangedEvent, filled: B.OrderFilledEvent): void {
        const { timestamp, bid: price } = e
        const profitLoss = Math.round((price - filled.entry!) * this.props.volume * 100) / 100;
        this.profitLoss = { type: "PROFITLOSS", timestamp, price, profitLoss };
        this.push({ type: "PROFITLOSS", timestamp, price, profitLoss });

        if (this.exitCondition(e)) {
            this.push({ type: "CLOSED", timestamp, exit: price, profitLoss })
            this.push({ type: "ENDED", timestamp, exit: price, profitLoss })
            this.push(null)
        }
    }
}

function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, entryCondition: Condition): OS.OrderStream<Props> {
    assert.strictEqual(props.tradeSide, "BUY");
    const exitCondition: Condition = e => {
        if(e.type !== "BID_PRICE_CHANGED") {
            return false;
        }
        const takeProfit = props.takeProfit ? props.takeProfit <= e.bid : false;
        const stopLoss = props.stopLoss ? props.stopLoss >= e.bid : false;
        return takeProfit || stopLoss;
    }
    return pipeline(
        spots,
        new ToBuyOrder(props, entryCondition, exitCondition),
        err => console.log("pipeline callback", err)
      );
}


class ToSellOrder<Props extends B.OrderProps> extends Transform implements B.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private readonly log: debug.Debugger;
    private askPrice: B.AskPriceChangedEvent | null = null;
    private filled: B.OrderFilledEvent | null = null;
    private profitLoss: B.OrderProfitLossEvent | null = null;
    private lifecyle = B.lifecycle();
    private timestamp: B.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      this.log = debug("order").extend(props.id);
    }

    closeOrder(): void {
      if (this.lifecyle.test({type: "CLOSED" })) {
            new Promise<B.OrderProfitLossEvent>(resolve => {
                if(this.profitLoss) {
                    return resolve(this.profitLoss);
                }
                const listener = (e: B.OrderEvent) => {
                    if(e.type === "PROFITLOSS") {
                        resolve(e);
                        this.off("data", listener);
                    }
                } 
                this.on("data", listener);
            }).then(({ timestamp, price: exit, profitLoss }) => {
              this.push({ type: "CLOSED", timestamp, exit, profitLoss })
              this.push({ type: "ENDED", timestamp, exit, profitLoss })
              this.push(null)
            })
            return;
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.lifecyle.state)})`);
    }

    cancelOrder(): void {
      if (this.lifecyle.test({type: "CANCELED" })) {
        this.push({ type: "CANCELED", timestamp: this.timestamp })
        this.push({ type: "ENDED", timestamp: this.timestamp })
        this.push(null)
        return;
      }
      throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.lifecyle.state)})`);
    }

    endOrder(): void {
      if (this.lifecyle.test({type: "CANCELED" })) {
          this.cancelOrder();
      } else if (this.lifecyle.test({type: "CLOSED" })) {
          this.closeOrder();
      }
  }
  
    push(event: B.OrderEvent | null): boolean {
      if (event && !this.lifecyle.test(event)) {
        return true;
      }
      if (event) {
        this.log("%j", event);
        this.timestamp = event.timestamp;
        this.lifecyle.update(event);
      }
      return super.push(event)
    }

    _transform(chunk: B.SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
        if(this.filled === null && chunk.type ==="BID_PRICE_CHANGED") {
            this.tryToFillOrder(chunk);
        } else if(this.filled === null && chunk.type === "ASK_PRICE_CHANGED") {
            this.askPrice = chunk;
        } else if(this.filled !== null && chunk.type === "ASK_PRICE_CHANGED") {
            this.tryToCloseOrder(chunk, this.filled);
        }
        callback();
    }

    private tryToFillOrder(e: B.BidPriceChangedEvent): void {
        const { timestamp } = e;
        this.push({ type: "CREATED", timestamp })
        this.push({ type: "ACCEPTED", timestamp })
        if (this.entryCondition(e)) {
            const { timestamp, bid: entry } = e;
            this.filled = { type: "FILLED", timestamp, entry }
            this.push({ type: "FILLED", timestamp, entry })
            if(this.askPrice) {
                this.tryToCloseOrder(this.askPrice, this.filled);
                this.askPrice = null; // just needed for faster profitLoss / close events
            }
        }
    }

    private tryToCloseOrder(e: B.AskPriceChangedEvent, filled: B.OrderFilledEvent): void {
        const { timestamp, ask: price } = e
        const profitLoss = Math.round((filled.entry - price) * this.props.volume * 100) / 100;
        this.profitLoss = { type: "PROFITLOSS", timestamp, price, profitLoss };
        this.push({ type: "PROFITLOSS", timestamp, price, profitLoss });

        if (this.exitCondition(e)) {
            this.push({ type: "CLOSED", timestamp, exit: price, profitLoss })
            this.push({ type: "ENDED", timestamp, exit: price, profitLoss })
            this.push(null)
        }
    }
}

function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, entryCondition: Condition): OS.OrderStream<Props> {
    assert.strictEqual(props.tradeSide, "SELL");
    const exitCondition: Condition = e => {
        if(e.type !== "ASK_PRICE_CHANGED") {
            return false;
        }
        const takeProfit = props.takeProfit ? props.takeProfit >= e.ask : false;
        const stopLoss = props.stopLoss ? props.stopLoss <= e.ask : false;
        return takeProfit || stopLoss;
    }
    return pipeline(
        spots,
        new ToSellOrder(props, entryCondition, exitCondition),
        err => console.log("pipeline callback", err)
      );
}

export function marketOrderFromSpotPrices(props: Omit<B.MarketOrderProps & { spots: B.SpotPricesStream }, "orderType">): OS.OrderStream<B.MarketOrderProps> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "MARKET" }, spots, () => true)
    }
    return sell({ ...rest, orderType: "MARKET" }, spots, () => true)
}

export function stopOrderFromSpotPrices(props: Omit<B.StopOrderProps & { spots: B.SpotPricesStream }, "orderType">): OS.OrderStream<B.StopOrderProps> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "STOP" }, spots, e => e.type === "ASK_PRICE_CHANGED" && e.ask >= props.enter)
    }
    return sell({ ...rest, orderType: "STOP" }, spots, e => e.type === "BID_PRICE_CHANGED" && e.bid <= props.enter)
}
