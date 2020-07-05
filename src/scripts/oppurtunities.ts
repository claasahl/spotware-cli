import { fromFiles } from "../services/local";
import ms from "ms";
import fs from "fs"
import { finished } from "stream";
import { AskPriceChangedEvent, BidPriceChangedEvent } from "../services/types";
import * as G from "../services/generic"
import * as T from "../services/types"
import { bullish, bearish } from "indicators"

export default async function main(simplifiedFormat: boolean, output: string, inputs: string[]) {
    type Oppurtunity = {
        orderType: "BUY",
        enter: AskPriceChangedEvent,
        high: BidPriceChangedEvent,
        low: BidPriceChangedEvent
    } | {
        orderType: "SELL",
        enter: BidPriceChangedEvent,
        high: AskPriceChangedEvent,
        low: AskPriceChangedEvent
    }
    const ranges: {
        id: string
        tradeSide: "SELL" | "BUY"
        trendbars: T.TrendbarEvent[]
        fromTimestamp: number,
        from: Date,
        toTimestamp: number,
        to: Date,
        ask: {
            series: (AskPriceChangedEvent & { hl: "high" | "low", date: Date })[]
            highs: (AskPriceChangedEvent & { date: Date })[]
            lows: (AskPriceChangedEvent & { date: Date })[]
        },
        bid: {
            series: (BidPriceChangedEvent & { hl: "high" | "low", date: Date })[]
            highs: (BidPriceChangedEvent & { date: Date })[]
            lows:( BidPriceChangedEvent & { date: Date })[]
        },
        oppurtunities: Oppurtunity[]
    }[] = []
    const emptyRange = (timestamp: T.Timestamp, id: string, tradeSide: T.TradeSide, trendbars: T.TrendbarEvent[]) => ({
            id,
            tradeSide,
            trendbars,
            fromTimestamp: timestamp,
            from: new Date(timestamp),
            toTimestamp: timestamp + range,
            to: new Date(timestamp + range),
            ask: {
                series: [],
                highs: [],
                lows: []
            },
            bid: {
                series: [],
                highs: [],
                lows: []
            },
            oppurtunities: []
        })
        function engulfed(candleA: T.TrendbarEvent, candleB: T.TrendbarEvent): boolean {
            const upperA = candleA.high;
            const lowerA = candleA.low;
            const upperB = candleB.high;
            const lowerB = candleB.low;
            return (
              (upperA >= upperB && lowerA < lowerB) ||
              (upperA > upperB && lowerA <= lowerB)
            );
          }

    const period = ms("15min");
    const symbol = Symbol.for("BTC/EUR");
    const spots = fromFiles({
        paths: inputs,
        symbol
    });
    const trendbars = G.toTrendbars({period, symbol, spots})
    const range = ms("30min");
    const trendbarEvents: T.TrendbarEvent[] = []
    trendbars.on("data", e => {
        trendbarEvents.push(e);
        if (trendbarEvents.length >= 2) {
          const first = trendbarEvents.shift()!;
          const second = trendbarEvents[0];
          if (bullish(first) && engulfed(first, second)) {
              ranges.push(emptyRange(e.timestamp, ranges.length.toString(), "BUY", [first, second]))
          } else if (bearish(first) && engulfed(first, second)) {
              ranges.push(emptyRange(e.timestamp, ranges.length.toString(), "SELL", [first, second]))
          }
        }
    });
    spots.on("data", e => {
        if(e.type === "ASK_PRICE_CHANGED") {
            for (const range of ranges) {
                if (e.timestamp >= range.fromTimestamp && e.timestamp < range.toTimestamp) {
                    if (range.ask.highs.length === 0 || range.ask.highs[range.ask.highs.length-1].ask < e.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "high") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...e, hl: "high", date: new Date(e.timestamp) })
                        range.ask.highs.push({ ...e, date: new Date(e.timestamp) })
                    }
                    if (range.ask.lows.length === 0 || range.ask.lows[range.ask.lows.length-1].ask > e.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "low") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...e, hl: "low", date: new Date(e.timestamp) })
                        range.ask.lows.push({ ...e, date: new Date(e.timestamp) })
                    }
                    break;
                }
            }
        } else if(e.type === "BID_PRICE_CHANGED") {
            for (const range of ranges) {
                if (e.timestamp >= range.fromTimestamp && e.timestamp < range.toTimestamp) {
                    if (range.bid.highs.length === 0 || range.bid.highs[range.bid.highs.length-1].bid < e.bid) {
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "high") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...e, hl: "high", date: new Date(e.timestamp) })
                        range.bid.highs.push({ ...e, date: new Date(e.timestamp) })
                    }
                    if (range.bid.lows.length === 0 || range.bid.lows[range.bid.lows.length-1].bid > e.bid) {
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "low") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...e, hl: "low", date: new Date(e.timestamp) })
                        range.bid.lows.push({ ...e, date: new Date(e.timestamp) })
                    }
                    break;
                }
            }
        }
    })
    finished(spots, () => {
        for(const range of ranges) {
            const lowAsk = range.ask.lows[range.ask.lows.length-1]
            const highAsk = range.ask.highs[range.ask.highs.length-1]
            const lowBid = range.bid.lows[range.bid.lows.length-1]
            const highBid = range.bid.highs[range.bid.highs.length-1]
            if(!lowAsk || !highBid) {
                continue;
            } else if(lowAsk.timestamp < highBid.timestamp && lowAsk.timestamp <= lowBid.timestamp && lowAsk.ask < highBid.bid) {
                range.oppurtunities.push({orderType: "BUY", enter: lowAsk, high: highBid, low: lowBid})
            } else if(highBid.timestamp < lowAsk.timestamp && highBid.timestamp <= highAsk.timestamp && highBid.bid > lowAsk.ask) {
                range.oppurtunities.push({orderType: "SELL", enter: highBid, high: highAsk, low: lowAsk})
            }
        }
        const cleaned = ranges
            .map(r => ({...r, ask: undefined, bid: undefined}))
            .map(r => {
                const oppurtunities = r.oppurtunities
                    .map(o => {
                        if(o.orderType === "BUY") {
                            return {orderType: o.orderType, enter: o.enter.ask, high: o.high.bid, low: o.low.bid};
                        } else if(o.orderType === "SELL") {
                            return {orderType: o.orderType, enter: o.enter.bid, high: o.high.ask, low: o.low.ask};
                        }
                        return undefined;
                    })
                const trendbars = r.trendbars
                    .map(t => {
                        delete t.timestamp
                        delete t.volume
                        delete t.type
                        return {...t}
                    })
                return {...r, trendbars, oppurtunities};
            })
            .filter(r => r.oppurtunities.length > 0)
            .map(r => {
                delete r.from
                delete r.fromTimestamp
                delete r.to
                delete r.toTimestamp
                return {...r}
            })
    
        const out = fs.createWriteStream(output)
        if(simplifiedFormat) {
            out.write(JSON.stringify(cleaned, null, 2))
        } else {
            out.write(JSON.stringify(ranges, null, 2))
        }
        out.end();
    })
}