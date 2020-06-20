import assert from "assert";
import { Transform, TransformCallback } from "stream";

import * as T from "../types"
import * as L from "../logging"

type Condition = (e: T.SpotPricesEvent) => boolean;

class ToBuyOrder<Props extends T.OrderProps> extends Transform implements T.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private bidPrice: T.BidPriceChangedEvent | null = null;
    private filled: T.OrderFilledEvent | null = null;
    private profitLoss: T.OrderProfitLossEvent | null = null;
    private lifecyle = T.lifecycle();
    private timestamp: T.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      L.logOrderEvents(this);
    }

    closeOrder(): void {
      if (this.lifecyle.test({type: "CLOSED" })) {
            new Promise<T.OrderProfitLossEvent>(resolve => {
                if(this.profitLoss) {
                    return resolve(this.profitLoss);
                }
                const listener = (e: T.OrderEvent) => {
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
  
    push(event: T.OrderEvent | null): boolean {
      if (event && !this.lifecyle.test(event)) {
        return true;
      }
      if (event) {
        this.timestamp = event.timestamp;
        this.lifecyle.update(event);
      }
      return super.push(event)
    }

    _transform(chunk: T.SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
        if(this.filled === null && chunk.type ==="ASK_PRICE_CHANGED") {
            this.tryToFillOrder(chunk);
        } else if(this.filled === null && chunk.type === "BID_PRICE_CHANGED") {
            this.bidPrice = chunk;
        } else if(this.filled !== null && chunk.type === "BID_PRICE_CHANGED") {
            this.tryToCloseOrder(chunk, this.filled);
        }
        callback();
    }

    private tryToFillOrder(e: T.AskPriceChangedEvent): void {
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

    private tryToCloseOrder(e: T.BidPriceChangedEvent, filled: T.OrderFilledEvent): void {
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

function buy<Props extends T.OrderProps>(props: Props, spots: T.SpotPricesStream, entryCondition: Condition): T.OrderStream<Props> {
    assert.strictEqual(props.tradeSide, "BUY");
    const exitCondition: Condition = e => {
        if(e.type !== "BID_PRICE_CHANGED") {
            return false;
        }
        const takeProfit = props.takeProfit ? props.takeProfit <= e.bid : false;
        const stopLoss = props.stopLoss ? props.stopLoss >= e.bid : false;
        return takeProfit || stopLoss;
    }
    return spots.pipe(new ToBuyOrder(props, entryCondition, exitCondition));
}


class ToSellOrder<Props extends T.OrderProps> extends Transform implements T.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private askPrice: T.AskPriceChangedEvent | null = null;
    private filled: T.OrderFilledEvent | null = null;
    private profitLoss: T.OrderProfitLossEvent | null = null;
    private lifecyle = T.lifecycle();
    private timestamp: T.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      L.logOrderEvents(this);
    }

    closeOrder(): void {
      if (this.lifecyle.test({type: "CLOSED" })) {
            new Promise<T.OrderProfitLossEvent>(resolve => {
                if(this.profitLoss) {
                    return resolve(this.profitLoss);
                }
                const listener = (e: T.OrderEvent) => {
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
  
    push(event: T.OrderEvent | null): boolean {
      if (event && !this.lifecyle.test(event)) {
        return true;
      }
      if (event) {
        this.timestamp = event.timestamp;
        this.lifecyle.update(event);
      }
      return super.push(event)
    }

    _transform(chunk: T.SpotPricesEvent, _encoding: string, callback: TransformCallback): void {
        if(this.filled === null && chunk.type ==="BID_PRICE_CHANGED") {
            this.tryToFillOrder(chunk);
        } else if(this.filled === null && chunk.type === "ASK_PRICE_CHANGED") {
            this.askPrice = chunk;
        } else if(this.filled !== null && chunk.type === "ASK_PRICE_CHANGED") {
            this.tryToCloseOrder(chunk, this.filled);
        }
        callback();
    }

    private tryToFillOrder(e: T.BidPriceChangedEvent): void {
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

    private tryToCloseOrder(e: T.AskPriceChangedEvent, filled: T.OrderFilledEvent): void {
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

function sell<Props extends T.OrderProps>(props: Props, spots: T.SpotPricesStream, entryCondition: Condition): T.OrderStream<Props> {
    assert.strictEqual(props.tradeSide, "SELL");
    const exitCondition: Condition = e => {
        if(e.type !== "ASK_PRICE_CHANGED") {
            return false;
        }
        const takeProfit = props.takeProfit ? props.takeProfit >= e.ask : false;
        const stopLoss = props.stopLoss ? props.stopLoss <= e.ask : false;
        return takeProfit || stopLoss;
    }
    return spots.pipe(new ToSellOrder(props, entryCondition, exitCondition));
}

export function marketOrderFromSpotPrices(props: Omit<T.MarketOrderProps & { spots: T.SpotPricesStream }, "orderType">): T.OrderStream<T.MarketOrderProps> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "MARKET" }, spots, () => true)
    }
    return sell({ ...rest, orderType: "MARKET" }, spots, () => true)
}

export function stopOrderFromSpotPrices(props: Omit<T.StopOrderProps & { spots: T.SpotPricesStream }, "orderType">): T.OrderStream<T.StopOrderProps> {
    const { spots, ...rest } = props;
    if (props.tradeSide === "BUY") {
        return buy({ ...rest, orderType: "STOP" }, spots, e => e.type === "ASK_PRICE_CHANGED" && e.ask >= props.enter)
    }
    return sell({ ...rest, orderType: "STOP" }, spots, e => e.type === "BID_PRICE_CHANGED" && e.bid <= props.enter)
}
