import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import * as B from "../base"

type Context = 
| B.OrderCreatedEvent
| B.OrderAcceptedEvent
| B.OrderRejectedEvent
| B.OrderFilledEvent
| B.OrderClosedEvent
| B.OrderCanceledEvent
| B.OrderExpiredEvent

type Event =
| { type: 'CREATE', event: B.OrderCreatedEvent }
| { type: 'ACCEPT', event: B.OrderAcceptedEvent }
| { type: 'REJECT', event: B.OrderRejectedEvent }
| { type: 'FILL', event: B.OrderFilledEvent }
| { type: 'CLOSE', event: B.OrderClosedEvent }
| { type: 'CANCEL', event: B.OrderCanceledEvent }
| { type: 'EXPIRE', event: B.OrderExpiredEvent }

type State =
  | { value: 'uninitialized', context: B.OrderCreatedEvent }
  | { value: 'created', context: B.OrderCreatedEvent }
  | { value: 'accepted', context: B.OrderAcceptedEvent }
  | { value: 'rejected', context: B.OrderRejectedEvent }
  | { value: 'filled', context: B.OrderFilledEvent }
  | { value: 'closed', context: B.OrderClosedEvent }
  | { value: 'canceled', context: B.OrderCanceledEvent }
  | { value: 'expired', context: B.OrderExpiredEvent }

class LocalOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
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
                            this.emitCreated(event.event)
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
                            this.emitAccepted(event.event)
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
                            this.emitFilled(event.event)
                        }
                    },
                    on: {
                        CLOSE: 'closed'
                    }
                },
                rejected: {
                    entry: (_context, event) => {
                        if(event.type === "REJECT") {
                            this.emitRejected(event.event)
                            this.emitEnded(event.event)
                        }
                    }
                },
                closed: {  
                    entry: (_context, event) => {
                        if(event.type === "CLOSE") {
                            this.emitClosed(event.event)
                            this.emitEnded(event.event)
                        }
                    }
                },
                canceled: { 
                    entry: (_context, event) => {
                        if(event.type === "CANCEL") {
                            this.emitCanceled(event.event)
                            this.emitEnded(event.event)
                        }
                    }
                },
                expired: {
                    entry: (_context, event) => {
                        if(event.type === "EXPIRE") {
                            this.emitExpired(event.event)
                            this.emitEnded(event.event)
                        }
                    }
                },
            }
        });
        this.service = interpret(machine);
        this.service.start();
    }
    async close(): Promise<B.OrderClosedEvent> {
        const {timestamp, price: exit, profitLoss} = await this.profitLoss();
        this.tryClose({ timestamp, exit, profitLoss })
        if(this.service.state.matches("closed")) {
            return this.closed()
        }
        throw new Error(`order ${this.props.id} cannot be closed (${JSON.stringify(this.service.state)})`);
    }
    async cancel(): Promise<B.OrderCanceledEvent> {
        const timestamp = Date.now();
        this.tryCancel({ timestamp })
        if(this.service.state.matches("canceled")) {
            return this.canceled();
        }
        throw new Error(`order ${this.props.id} cannot be canceled (${JSON.stringify(this.service.state)})`);
    }
    async end(): Promise<B.OrderEndedEvent> {
        if(["created", "accepted", "canceled"].includes(this.service.state.value)) {
            return this.cancel();
        } else if(["filled", "closed"].includes(this.service.state.value)) {
            return this.close();
        }
        return this.ended()
    }

    
    tryCreate(e: B.OrderCreatedEvent): void {
        this.service.send({ type: "CREATE", event: e})
      }
    
      tryAccept(e: B.OrderAcceptedEvent): void {
          this.service.send({ type: "ACCEPT", event: e})
      }
    
      tryReject(e: B.OrderRejectedEvent): void {
          this.service.send({ type: "REJECT", event: e})
      }
    
      tryFill(e: B.OrderFilledEvent): void {
          this.service.send({ type: "FILL", event: e})
      }
    
      tryClose(e: B.OrderClosedEvent): void {
          this.service.send({ type: "CLOSE", event: e})
      }
    
      tryCancel(e: B.OrderCanceledEvent): void {
          this.service.send({ type: "CANCEL", event: e})
      }
    
      tryExpire(e: B.OrderExpiredEvent): void {
          this.service.send({ type: "EXPIRE", event: e})
      }
}

async function fromSpotPrices<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, buyCond: (e: B.AskPriceChangedEvent) => boolean, sellCond: (e: B.BidPriceChangedEvent) => boolean): Promise<B.OrderStream<Props>> {
    const stream = new LocalOrderStream<Props>(props);
    stream.tryCreate({ timestamp: Date.now() })
    if (props.tradeSide === "BUY") {
        const fill = (e: B.AskPriceChangedEvent): boolean => {
            const { timestamp, ask: entry } = e;
            if (buyCond(e)) {
                stream.tryFill({ timestamp, entry })

                const update = (e: B.BidPriceChangedEvent) => {
                    const {timestamp, bid: price} = e
                    const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss >= price ||
                        props.takeProfit && props.takeProfit <= price) {
                        stream.tryClose({timestamp, exit: price, profitLoss})
                    }
                }
                spots.bid().then(e => {
                    update(e);
                    spots.on("bid", update)
                })
                stream.once("ended", () => spots.off("bid", update))
                return true;
            }
            return false;
        }
        spots.ask().then(e => {
            if(!fill(e)) {
                spots.on("ask", fill);
                stream.once("filled", () => spots.off("ask", fill))
                stream.once("ended", () => spots.off("ask", fill))
            }
        })
    } else if (props.tradeSide === "SELL") {
        const fill = (e: B.BidPriceChangedEvent): boolean => {
            const { timestamp, bid: entry } = e;
            if (sellCond(e)) {
                stream.tryFill({ timestamp, entry })

                const update = (e: B.AskPriceChangedEvent) => {
                    const {timestamp, ask: price} = e
                    const profitLoss = Math.round((entry - price) * stream.props.volume * 100) / 100;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss <= price ||
                        props.takeProfit && props.takeProfit >= price) {
                        stream.tryClose({timestamp, exit: price, profitLoss})
                    }
                }
                spots.ask().then(e => {
                    update(e);
                    spots.on("ask", update)
                })
                stream.once("ended", () => spots.off("ask", update))
                return true;
            }
            return false;
        }
        spots.bid().then(e => {
            if(!fill(e)) {
                spots.on("bid", fill)
                stream.once("filled", () => spots.off("bid", fill))
                stream.once("ended", () => spots.off("bid", fill))
            }
        })
    }
    if(props.expiresAt) {
        const expiration = (e: B.AskPriceChangedEvent | B.BidPriceChangedEvent) => {
            const { timestamp } = e;
            if(timestamp >= props.expiresAt!) {
                stream.tryExpire({ timestamp })
            }
        }
        stream.once("accepted", () => {
            spots.on("ask", expiration);
            spots.on("bid", expiration);
            stream.once("filled", () => {
                spots.off("ask", expiration);
                spots.off("bid", expiration);
            });
            stream.once("ended", () => {
                spots.off("ask", expiration);
                spots.off("bid", expiration);
            });
        })
    }
    stream.tryAccept({ timestamp: Date.now() })
    return stream;
}

export function marketOrderFromSpotPrices(props: Omit<B.MarketOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<B.OrderStream<B.MarketOrderProps>> {
    const {spots, ...rest} = props;
    const buyCond = () => true
    const sellCond = () => true
    return fromSpotPrices({...rest, orderType: "MARKET"}, spots, buyCond, sellCond)
}


export function stopOrderFromSpotPrices(props: Omit<B.StopOrderProps & { spots: B.SpotPricesStream }, "orderType">): Promise<B.OrderStream<B.StopOrderProps>> {
    const {spots, ...rest} = props;
    const buyCond = ({ask: entry}: B.AskPriceChangedEvent) => entry >= props.enter
    const sellCond = ({bid: entry}: B.BidPriceChangedEvent) => entry <= props.enter
    return fromSpotPrices({...rest, orderType: "STOP"}, spots, buyCond, sellCond)
}
