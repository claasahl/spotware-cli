import * as B from "../base"

class LocalOrderStream<Props extends B.OrderProps> extends B.DebugOrderStream<Props> {
    end() {
        // implement me & others
        return this;
    }
}

export function marketOrderFromSpotPrices(props: B.MarketOrderProps & { spots: B.SpotPricesStream }): B.OrderStream<B.MarketOrderProps> {
    const { spots } = props;
    const stream = new LocalOrderStream(props);
    if (props.tradeSide === "BUY") {
        spots.ask(e => {
            const {timestamp, ask: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: B.BidPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (e.bid - entry) * stream.props.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.bid(e => {
                update(e);
                spots.on("bid", update)
            })
            stream.once("end", () => spots.off("bid", update))
        })
    } else if (props.tradeSide === "SELL") {
        spots.bid(e => {
            const {timestamp, bid: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: B.AskPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (entry - e.ask) * stream.props.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.ask(e => {
                update(e);
                spots.on("ask", update)
            })
            stream.once("end", () => spots.off("ask", update))
        })
    }
    stream.emitAccepted({timestamp: Date.now()})
    return stream;
}


export function stopOrderFromSpotPrices(props: B.StopOrderProps & { spots: B.SpotPricesStream }): B.OrderStream<B.StopOrderProps> {
    const { spots } = props;
    const stream = new LocalOrderStream(props);
    if (props.tradeSide === "BUY") {
        spots.ask(e => {
            const {timestamp, ask: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: B.BidPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (e.bid - entry) * stream.props.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.bid(e => {
                update(e);
                spots.on("bid", update)
            })
            stream.once("end", () => spots.off("bid", update))
        })
    } else if (props.tradeSide === "SELL") {
        spots.bid(e => {
            const {timestamp, bid: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: B.AskPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (entry - e.ask) * stream.props.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.ask(e => {
                update(e);
                spots.on("ask", update)
            })
            stream.once("end", () => spots.off("ask", update))
        })
    }
    stream.emitAccepted({timestamp: Date.now()})
    return stream;
}