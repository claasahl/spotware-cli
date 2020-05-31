import assert from "assert";
import { Transform, TransformCallback, pipeline } from "stream";
import debug from "debug";
import { createMachine, StateMachine } from '@xstate/fsm';

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

type Context = {}

type Event =
  | { type: 'CREATE', event: B.OrderCreatedEvent }
  | { type: 'ACCEPT', event: B.OrderAcceptedEvent }
  | { type: 'REJECT', event: B.OrderRejectedEvent }
  | { type: 'FILL', event: B.OrderFilledEvent }
  | { type: 'PROFITLOSS', event: B.OrderProfitLossEvent }
  | { type: 'CLOSE', event: B.OrderClosedEvent }
  | { type: 'CANCEL', event: B.OrderCanceledEvent }
  | { type: 'EXPIRE', event: B.OrderExpiredEvent }

type State =
  | { value: 'uninitialized', context: {} }
  | { value: 'created', context: {} }
  | { value: 'accepted', context: {} }
  | { value: 'rejected', context: {} }
  | { value: 'filled', context: {} }
  | { value: 'closed', context: {} }
  | { value: 'canceled', context: {} }
  | { value: 'expired', context: {} }

const machine = createMachine<Context, Event, State>({
  initial: "uninitialized",
  states: {
    uninitialized: {
      on: {
        CREATE: 'created'
      }
    },
    created: {
      on: {
        ACCEPT: 'accepted',
        REJECT: 'rejected',
        CANCEL: 'canceled'
      }
    },
    accepted: {
      on: {
        FILL: 'filled',
        CANCEL: 'canceled',
        EXPIRE: 'expired'
      }
    },
    filled: {
      on: {
        CLOSE: 'closed',
        PROFITLOSS: 'filled'
      }
    },
    rejected: {},
    closed: {},
    canceled: {},
    expired: {},
  }
});

type Condition = (e: B.SpotPricesEvent) => boolean;

class ToBuyOrder<Props extends B.OrderProps> extends Transform implements B.OrderStream<Props> {
    readonly props: Props;
    private readonly entryCondition: Condition;
    private readonly exitCondition: Condition;
    private readonly log: debug.Debugger;
    private bidPrice: B.BidPriceChangedEvent | null = null;
    private filled: B.OrderFilledEvent | null = null;
    private profitLoss: B.OrderProfitLossEvent | null = null;
    private state: StateMachine.State<Context, Event, State>;
    private timestamp: B.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      this.log = debug("order").extend(props.id);
      this.state = machine.initialState
    }

    async closeOrder(): Promise<void> {
        if ("closed" === this.state.value) {
            return;
        } else if ("filled" === this.state.value) {
            const { timestamp, price: exit, profitLoss } = await new Promise(resolve => {
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
            })
            this.event({type: "CLOSE", event: { type: "CLOSED", timestamp, exit, profitLoss }})
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
            this.event({type: "CANCEL", event: { type: "CANCELED", timestamp: this.timestamp }})
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
  
    push(event: B.OrderEvent | null): boolean {
      if (event) {
        this.log("%j", event);
        this.timestamp = event.timestamp;
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
        this.event({ type: "CREATE", event: { type: "CREATED", timestamp }})
        this.event({ type: "ACCEPT", event: { type: "ACCEPTED", timestamp }})
        if (this.entryCondition(e)) {
            const { timestamp, ask: entry } = e;
            this.filled = { type: "FILLED", timestamp, entry }
            this.event({ type: "FILL", event: { type: "FILLED", timestamp, entry }})
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
        this.event({ type: "PROFITLOSS", event: { type: "PROFITLOSS", timestamp, price, profitLoss }});

        if (this.exitCondition(e)) {
            this.event({ type: "CLOSE", event: { type: "CLOSED", timestamp, exit: price, profitLoss }})
        }
    }

    private event(e: Event): void {
        const oldState = this.state;
        const newState = machine.transition(oldState, e);
        this.state = newState;
    
        if (newState.changed && e.type === "CREATE") {
          this.push(e.event)
        } else if (newState.changed && e.type === "ACCEPT") {
          this.push(e.event)
        } else if (newState.changed && e.type === "FILL") {
          this.push(e.event)
        } else if (newState.value === "filled" && e.type === "PROFITLOSS") {
          this.push(e.event)
        } else if (newState.changed && e.type === "REJECT") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "CLOSE") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "CANCEL") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "EXPIRE") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        }
      }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, entryCondition: Condition): Promise<OS.OrderStream<Props>> {
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
    private state: StateMachine.State<Context, Event, State>;
    private timestamp: B.Timestamp = 0;
  
    constructor(props: Props, entryCondition: Condition, exitCondition: Condition) {
      super({objectMode: true});
      this.props = Object.freeze(props);
      this.entryCondition = entryCondition;
      this.exitCondition = exitCondition;
      this.log = debug("order").extend(props.id);
      this.state = machine.initialState
    }

    async closeOrder(): Promise<void> {
        if ("closed" === this.state.value) {
            return;
        } else if ("filled" === this.state.value) {
            const { timestamp, price: exit, profitLoss } = await new Promise(resolve => {
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
            })
            this.event({type: "CLOSE", event: { type: "CLOSED", timestamp, exit, profitLoss }})
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
            this.event({type: "CANCEL", event: { type: "CANCELED", timestamp: this.timestamp }})
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
  
    push(event: B.OrderEvent | null): boolean {
      if (event) {
        this.log("%j", event);
        this.timestamp = event.timestamp;
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
        this.event({ type: "CREATE", event: { type: "CREATED", timestamp }})
        this.event({ type: "ACCEPT", event: { type: "ACCEPTED", timestamp }})
        if (this.entryCondition(e)) {
            const { timestamp, bid: entry } = e;
            this.filled = { type: "FILLED", timestamp, entry }
            this.event({ type: "FILL", event: { type: "FILLED", timestamp, entry }})
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
        this.event({ type: "PROFITLOSS", event: { type: "PROFITLOSS", timestamp, price, profitLoss }});

        if (this.exitCondition(e)) {
            this.event({ type: "CLOSE", event: { type: "CLOSED", timestamp, exit: price, profitLoss }})
        }
    }

    private event(e: Event): void {
        const oldState = this.state;
        const newState = machine.transition(oldState, e);
        this.state = newState;
    
        if (newState.changed && e.type === "CREATE") {
          this.push(e.event)
        } else if (newState.changed && e.type === "ACCEPT") {
          this.push(e.event)
        } else if (newState.changed && e.type === "FILL") {
          this.push(e.event)
        } else if (newState.value === "filled" && e.type === "PROFITLOSS") {
          this.push(e.event)
        } else if (newState.changed && e.type === "REJECT") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "CLOSE") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "CANCEL") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        } else if (newState.changed && e.type === "EXPIRE") {
          this.push(e.event)
          this.push({ ...e.event, type: "ENDED" })
          this.push(null)
        }
      }
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, entryCondition: Condition): Promise<OS.OrderStream<Props>> {
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
    return sell({ ...rest, orderType: "STOP" }, spots, e => e.type === "BID_PRICE_CHANGED" && e.bid <= props.enter)
}
