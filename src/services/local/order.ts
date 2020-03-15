import { DebugOrderStream, OrderStream, OrderProps } from "../order"
import { SpotPricesStream, BidPriceChangedEvent, AskPriceChangedEvent } from "../spotPrices";

export function fromSpotPrices(props: OrderProps & { spots: SpotPricesStream }): OrderStream {
    const { spots, ...originalProps } = props;
    const stream = new DebugOrderStream(originalProps);
    if (props.tradeSide === "BUY") {
        spots.ask.then(ask => {
            const entry = ask;
            stream.emitFilled({ timestamp: Date.now(), entry })

            const update = (e: BidPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (e.bid - entry) * stream.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.bid.then(bid => {
                update({bid, timestamp: Date.now()});
                spots.on("bid", update)
                stream.on("end", () => stream.off("bid", update))
            })
        })
    } else if (props.tradeSide === "SELL") {
        spots.bid.then(bid => {
            const entry = bid;
            stream.emitFilled({ timestamp: Date.now(), entry })

            const update = (e: AskPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (entry - e.ask) * stream.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.ask.then(ask => {
                update({ask, timestamp: Date.now()});
                spots.on("ask", update)
                stream.on("end", () => stream.off("ask", update))
            })
        })
    }
    return stream;
}