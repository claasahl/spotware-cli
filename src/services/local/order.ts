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
    close(): this {
        if(this.canBeClosed) {
            this.profitLoss(e => {
                this.emitClosed({ timestamp: e.timestamp, exit: e.price, profitLoss: e.profitLoss})
                this.emitEnded({ timestamp: e.timestamp, exit: e.price, profitLoss: e.profitLoss})
            })
            return this;
        }
        throw new Error(`order ${this.props.id} cannot be closed ${JSON.stringify({canBeClosed: this.canBeClosed, canBeCanceled: this.canBeCanceled, canBeAmended: this.canBeAmended})}`);
    }
    cancel(): this {
        if(this.canBeCanceled) {
            this.emitCanceled({timestamp: Date.now()})
            this.emitEnded({timestamp: Date.now()})
            return this;
        }
        throw new Error(`order ${this.props.id} cannot be canceled ${JSON.stringify({canBeClosed: this.canBeClosed, canBeCanceled: this.canBeCanceled, canBeAmended: this.canBeAmended})}`);
    }
    end(): this {
        if(this.canBeCanceled) {
            return this.cancel();
        } else if(this.canBeClosed) {
            return this.close();
        } else {
            return this;
        }
    }
}

function fromSpotPrices<Props extends B.OrderProps>(props: Props, spots: B.SpotPricesStream, buyCond: (e: B.AskPriceChangedEvent) => boolean, sellCond: (e: B.BidPriceChangedEvent) => boolean): B.OrderStream<Props> {
    const stream = new LocalOrderStream<Props>(props);
    if (props.tradeSide === "BUY") {
        const fill = (e: B.AskPriceChangedEvent): boolean => {
            const { timestamp, ask: entry } = e;
            if (buyCond(e)) {
                stream.emitFilled({ timestamp, entry })

                const update = (e: B.BidPriceChangedEvent) => {
                    const {timestamp, bid: price} = e
                    const profitLoss = (price - entry) * stream.props.volume;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss >= e.bid ||
                        props.takeProfit && props.takeProfit <= e.bid) {
                        stream.emitClosed({timestamp, exit: e.bid, profitLoss})
                        stream.emitEnded({timestamp, exit: e.bid, profitLoss})
                    }
                }
                spots.bid(e => {
                    update(e);
                    spots.on("bid", update)
                })
                stream.once("ended", () => spots.off("bid", update))
                return true;
            }
            return false;
        }
        spots.ask(e => {
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
                    const profitLoss = (entry - e.ask) * stream.props.volume;
                    stream.emitProfitLoss({ timestamp, price, profitLoss })

                    if(props.stopLoss && props.stopLoss <= e.ask ||
                        props.takeProfit && props.takeProfit >= e.ask) {
                        stream.emitClosed({timestamp, exit: e.ask, profitLoss})
                        stream.emitEnded({timestamp, exit: e.ask, profitLoss})
                    }
                }
                spots.ask(e => {
                    update(e);
                    spots.on("ask", update)
                })
                stream.once("ended", () => spots.off("ask", update))
                return true;
            }
            return false;
        }
        spots.bid(e => {
            if(!fill(e)) {
                spots.on("bid", fill)
                stream.once("filled", () => spots.off("bid", fill))
                stream.once("ended", () => spots.off("bid", fill))
            }
        })
    }
    stream.emitAccepted({ timestamp: Date.now() })
    return stream;
}

export function marketOrderFromSpotPrices(props: B.MarketOrderProps & { spots: B.SpotPricesStream }): B.OrderStream<B.MarketOrderProps> {
    const {spots, ...rest} = props;
    const buyCond = () => true
    const sellCond = () => true
    return fromSpotPrices(rest, spots, buyCond, sellCond)  
}


export function stopOrderFromSpotPrices(props: B.StopOrderProps & { spots: B.SpotPricesStream }): B.OrderStream<B.StopOrderProps> {
    const {spots, ...rest} = props;
    const buyCond = ({ask: entry}: B.AskPriceChangedEvent) => entry >= props.enter
    const sellCond = ({bid: entry}: B.BidPriceChangedEvent) => entry <= props.enter
    return fromSpotPrices(rest, spots, buyCond, sellCond)   
}