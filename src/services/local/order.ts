import * as B from "../base"

class LocalOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
    end() {
        // implement me & others
        return this;
    }
}

function fromSpotPrices<Props extends B.OrderProps>(props: Props & { spots: B.SpotPricesStream }, buyCond: (e: B.AskPriceChangedEvent) => boolean, sellCond: (e: B.BidPriceChangedEvent) => boolean): B.OrderStream<Props> {
    const { spots } = props;
    const stream = new LocalOrderStream(props);
    if (props.tradeSide === "BUY") {
        const fill = (e: B.AskPriceChangedEvent): boolean => {
            const { timestamp, ask: entry } = e;
            if (buyCond(e)) {
                stream.emitFilled({ timestamp, entry })

                const update = (e: B.BidPriceChangedEvent) => {
                    const timestamp = e.timestamp
                    const profitLoss = (e.bid - entry) * stream.props.volume;
                    stream.emitProfitLoss({ timestamp, profitLoss })

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
                    const timestamp = e.timestamp
                    const profitLoss = (entry - e.ask) * stream.props.volume;
                    stream.emitProfitLoss({ timestamp, profitLoss })

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
    const buyCond = () => true
    const sellCond = () => true
    return fromSpotPrices(props, buyCond, sellCond)  
}


export function stopOrderFromSpotPrices(props: B.StopOrderProps & { spots: B.SpotPricesStream }): B.OrderStream<B.StopOrderProps> {
    const buyCond = ({ask: entry}: B.AskPriceChangedEvent) => entry >= props.enter
    const sellCond = ({bid: entry}: B.BidPriceChangedEvent) => entry <= props.enter
    return fromSpotPrices(props, buyCond, sellCond)   
}