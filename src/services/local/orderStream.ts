import assert from "assert";
import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import * as OS from "../base/orderStream"
import * as B from "../base"
import { AskPriceChangedEvent } from "../base";

type Context = 
| OS.OrderCreatedEvent
| OS.OrderAcceptedEvent
| OS.OrderRejectedEvent
| OS.OrderFilledEvent
| OS.OrderClosedEvent
| OS.OrderCanceledEvent
| OS.OrderExpiredEvent

type Event =
| { type: 'CREATE', event: OS.OrderCreatedEvent }
| { type: 'ACCEPT', event: OS.OrderAcceptedEvent }
| { type: 'REJECT', event: OS.OrderRejectedEvent }
| { type: 'FILL', event:   OS.OrderFilledEvent }
| { type: 'CLOSE', event:  OS.OrderClosedEvent }
| { type: 'CANCEL', event: OS.OrderCanceledEvent }
| { type: 'EXPIRE', event: OS.OrderExpiredEvent }

type State =
  | { value: 'uninitialized', context: OS.OrderCreatedEvent }
  | { value: 'created', context: OS.OrderCreatedEvent }
  | { value: 'accepted', context: OS.OrderAcceptedEvent }
  | { value: 'rejected', context: OS.OrderRejectedEvent }
  | { value: 'filled', context: OS.OrderFilledEvent }
  | { value: 'closed', context: OS.OrderClosedEvent }
  | { value: 'canceled', context: OS.OrderCanceledEvent }
  | { value: 'expired', context: OS.OrderExpiredEvent }

  class LocalOrderStream<Props extends OS.OrderProps> extends OS.OrderStream<Props> {
    private service: StateMachine.Service<Context, Event, State>;
    constructor(props: Props) {
        super(props);
        const machine = createMachine<Context, Event, State>({
            initial: "uninitialized",
            states: {
                uninitialized: {
                    on: {
                        CREATE: 'created'
                    }
                },
                created: {
                    entry: (_context, event) => {
                        if(event.type === "CREATE") {
                            this.push(event.event)
                        }
                    },
                    on: {
                        ACCEPT: 'accepted',
                        REJECT: 'rejected',
                        CANCEL: 'canceled'
                    }
                },
                accepted: {
                    entry: (_context, event) => {
                        if(event.type === "ACCEPT") {
                            this.push(event.event)
                        }
                    },
                    on: {
                        FILL: 'filled',
                        CANCEL: 'canceled',
                        EXPIRE: 'expired'
                    }
                },
                filled: {
                    entry: (_context, event) => {
                        if(event.type === "FILL") {
                            this.push(event.event)
                        }
                    },
                    on: {
                        CLOSE: 'closed'
                    }
                },
                rejected: {
                    entry: (_context, event) => {
                        if(event.type === "REJECT") {
                            this.push(event.event)
                            this.push({...event.event, type: "ENDED"})
                        }
                    }
                },
                closed: {  
                    entry: (_context, event) => {
                        if(event.type === "CLOSE") {
                            this.push(event.event)
                            this.push({...event.event, type: "ENDED"})
                        }
                    }
                },
                canceled: { 
                    entry: (_context, event) => {
                        if(event.type === "CANCEL") {
                            this.push(event.event)
                            this.push({...event.event, type: "ENDED"})
                        }
                    }
                },
                expired: {
                    entry: (_context, event) => {
                        if(event.type === "EXPIRE") {
                            this.push(event.event)
                            this.push({...event.event, type: "ENDED"})
                        }
                    }
                },
            }
        });
        this.service = interpret(machine);
        this.service.start();
    }
    async close(): Promise<OS.OrderClosedEvent> {
        const {timestamp, price: exit, profitLoss} = await this.profitLoss();
        this.tryClose({ timestamp, exit, profitLoss })
        if(this.service.state.matches("closed")) {
            return this.closed()
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.service.state)})`);
    }
    async cancel(): Promise<OS.OrderCanceledEvent> {
        const {timestamp} = await this.created(); // TODO: improve estimate of timestamp
        this.tryCancel({ timestamp })
        if(this.service.state.matches("canceled")) {
            return this.canceled();
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.service.state)})`);
    }
    async end(): Promise<OS.OrderEndedEvent> {
        if(["created", "accepted", "canceled"].includes(this.service.state.value)) {
            await this.cancel();
        } else if(["filled", "closed"].includes(this.service.state.value)) {
            await this.close();
        }
        return this.ended()
    }

    
    tryCreate(e: Omit<OS.OrderCreatedEvent, "type">): void {
        this.service.send({ type: "CREATE", event: {...e, type: "CREATED"}})
      }
    
      tryAccept(e: Omit<OS.OrderAcceptedEvent, "type">): void {
          this.service.send({ type: "ACCEPT", event: {...e, type: "ACCEPTED"}})
      }
    
      tryReject(e: Omit<OS.OrderRejectedEvent, "type">): void {
          this.service.send({ type: "REJECT", event: {...e, type: "REJECTED"}})
      }
    
      tryFill(e: Omit<OS.OrderFilledEvent, "type">): void {
          this.service.send({ type: "FILL", event: {...e, type: "FILLED"}})
      }
    
      tryClose(e: Omit<OS.OrderClosedEvent, "type">): void {
          this.service.send({ type: "CLOSE", event: {...e, type: "CLOSED"}})
      }
    
      tryCancel(e: Omit<OS.OrderCanceledEvent, "type">): void {
          this.service.send({ type: "CANCEL", event: {...e, type: "CANCELED"}})
      }
    
      tryExpire(e: Omit<OS.OrderExpiredEvent, "type">): void {
          this.service.send({ type: "EXPIRE", event: {...e, type: "EXPIRED"}})
      }
}

async function buy<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.AskPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "BUY");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: AskPriceChangedEvent) => {
        if(condition(e)) {
            spots.off("ask", fill);
            const {timestamp, ask: entry} = e;
            stream.tryFill({timestamp, entry})

            const update = (e: B.BidPriceChangedEvent) => {
                const {timestamp, bid: price} = e
                const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                stream.push({type: "PROFITLOSS", timestamp, price, profitLoss}); // TODO no "push"

                if(props.stopLoss && props.stopLoss >= price ||
                    props.takeProfit && props.takeProfit <= price) {
                    spots.off("bid", update);
                    stream.tryClose({timestamp, exit: price, profitLoss})
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
        stream.tryCreate({timestamp})
        stream.tryAccept({timestamp})
        if(!fill(e)) {
            spots.on("ask", fill);
        }
    })
    return stream;
}

async function sell<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, condition: (e: B.BidPriceChangedEvent) => boolean): Promise<OS.OrderStream<Props>> {
    assert.strictEqual(props.tradeSide, "SELL");
    const stream = new LocalOrderStream<Props>(props);
    const fill = (e: B.BidPriceChangedEvent) => {
        if(condition(e)) {
            spots.off("bid", fill);
            const {timestamp, bid: entry} = e;
            stream.tryFill({timestamp, entry})

            const update = (e: B.AskPriceChangedEvent) => {
                const {timestamp, ask: price} = e
                const profitLoss = Math.round((entry - price) * stream.props.volume * 100) / 100;
                stream.push({type: "PROFITLOSS", timestamp, price, profitLoss}); // TODO no "push"

                if(props.stopLoss && props.stopLoss <= price ||
                    props.takeProfit && props.takeProfit >= price) {
                    spots.off("ask", update);
                    stream.tryClose({timestamp, exit: price, profitLoss})
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
        stream.tryCreate({timestamp})
        stream.tryAccept({timestamp})
        if(!fill(e)) {
            spots.on("bid", fill);
        }
    })
    return stream;
}

export function marketOrderFromSpotPrices(props: Omit<B.MarketOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OS.OrderStream<B.MarketOrderProps>> {
    const {spots, ...rest} = props;
    if(props.tradeSide === "BUY") {
        return buy({...rest, orderType: "MARKET"}, spots, () => true)
    }
    return sell({...rest, orderType: "MARKET"}, spots, () => true)
}

export function stopOrderFromSpotPrices(props: Omit<B.StopOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<OS.OrderStream<B.StopOrderProps>> {
    const {spots, ...rest} = props;
    if(props.tradeSide === "BUY") {
        return buy({...rest, orderType: "STOP"}, spots, e => e.ask >= props.enter)
    }
    return sell({...rest, orderType: "STOP"}, spots, e => e.bid <= props.enter)
}
