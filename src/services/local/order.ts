import * as B from "../base"

class LocalOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
    private canBeClosed: boolean = false;
    private canBeCanceled: boolean = true;
    private canBeAmended: boolean = true;
    constructor(props: Props) {
        super(props);
        const reset = () => {
            this.canBeClosed = false;
            this.canBeCanceled = false;
            this.canBeAmended = false;
        }
        this.on("accepted", () => {
            this.canBeClosed = false;
            this.canBeCanceled = true;
            this.canBeAmended = true;
        })
        this.on("rejected", () => reset())
        this.on("filled", () => {
            this.canBeClosed = true;
            this.canBeCanceled = false;
            this.canBeAmended = false;
        })
        this.on("closed", () => reset())
        this.on("canceled", () => reset())
        this.on("ended", () => reset())
    }
    async close(): Promise<B.OrderClosedEvent> {
        if(this.canBeClosed) {
            const {timestamp, price: exit, profitLoss} = await this.profitLoss()
            this.emitClosed({ timestamp, exit, profitLoss})
            this.emitEnded({ timestamp, exit, profitLoss})
            return { timestamp, exit, profitLoss}
        }
        throw new Error(`order ${this.props.id} cannot be closed ${JSON.stringify({canBeClosed: this.canBeClosed, canBeCanceled: this.canBeCanceled, canBeAmended: this.canBeAmended})}`);
    }
    cancel(): Promise<B.OrderCanceledEvent> {
        if(this.canBeCanceled) {
            this.emitCanceled({timestamp: Date.now()})
            this.emitEnded({timestamp: Date.now()})
            return Promise.resolve({timestamp: Date.now()})
        }
        throw new Error(`order ${this.props.id} cannot be canceled ${JSON.stringify({canBeClosed: this.canBeClosed, canBeCanceled: this.canBeCanceled, canBeAmended: this.canBeAmended})}`);
    }
    async end(): Promise<B.OrderEndedEvent> {
        if(this.canBeCanceled) {
            await this.cancel();
        } else if(this.canBeClosed) {
            await this.close();
        }
        return this.ended()
    }
    amend(): Promise<B.OrderAmendedEvent> {
        if(this.canBeAmended) {
            throw new Error("not implemented");
        }
        throw new Error(`order ${this.props.id} cannot be amended`);
    }
}

async function fromSpotPrices<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, buyCond: (e: B.AskPriceChangedEvent) => boolean, sellCond: (e: B.BidPriceChangedEvent) => boolean): Promise<B.OrderStream<Props>> {
    const stream = new LocalOrderStream<Props>(props);
    stream.emitCreated({ timestamp: Date.now() })
    if (props.tradeSide === "BUY") {
        const fill = (e: B.AskPriceChangedEvent): boolean => {
            const { timestamp, ask: entry } = e;
            if (buyCond(e)) {
                stream.emitFilled({ timestamp, entry })

                const update = (e: B.BidPriceChangedEvent) => {
                    const {timestamp, bid: price} = e
                    const profitLoss = Math.round((price - entry) * stream.props.volume * 100) / 100;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss >= price ||
                        props.takeProfit && props.takeProfit <= price) {
                        stream.emitClosed({timestamp, exit: price, profitLoss})
                        stream.emitEnded({timestamp, exit: price, profitLoss})
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
                stream.emitFilled({ timestamp, entry })

                const update = (e: B.AskPriceChangedEvent) => {
                    const {timestamp, ask: price} = e
                    const profitLoss = Math.round((entry - price) * stream.props.volume * 100) / 100;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss <= price ||
                        props.takeProfit && props.takeProfit >= price) {
                        stream.emitClosed({timestamp, exit: price, profitLoss})
                        stream.emitEnded({timestamp, exit: price, profitLoss})
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
                stream.emitExpired({ timestamp })
                stream.emitEnded({ timestamp })
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
    stream.emitAccepted({ timestamp: Date.now() })
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
