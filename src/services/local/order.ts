import { DebugOrderStream, OrderStream, OrderProps } from "../order"
import { SpotPricesStream, BidPriceChangedEvent, AskPriceChangedEvent } from "../spotPrices";

export function fromSpotPrices(props: OrderProps & { spots: SpotPricesStream }): OrderStream {
    const { spots, ...originalProps } = props;
    const stream = new DebugOrderStream(originalProps);
    if (props.tradeSide === "BUY") {
        spots.ask.then(e => {
            const {timestamp, ask: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: BidPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (e.bid - entry) * stream.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.bid.then(e => {
                update(e);
                spots.on("bid", update)
                stream.on("end", () => stream.off("bid", update))
            })
        })
    } else if (props.tradeSide === "SELL") {
        spots.bid.then(e => {
            const {timestamp, bid: entry} = e;
            stream.emitFilled({ timestamp, entry })

            const update = (e: AskPriceChangedEvent) => {
                const timestamp = e.timestamp
                const profitLoss = (entry - e.ask) * stream.volume;
                stream.emitProfitLoss({ timestamp, profitLoss })
            }
            spots.ask.then(e => {
                update(e);
                spots.on("ask", update)
                stream.on("end", () => stream.off("ask", update))
            })
        })
    }
    return stream;
}