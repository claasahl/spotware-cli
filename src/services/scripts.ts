import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import { fromNothing, fromFiles } from "./local";
import config from "../config";
import { fromSomething } from "./spotware/account";
import ms from "ms";
import fs from "fs"
import readline from "readline";
import { obj as multistream } from "multistream";
import { finished } from "stream";
import { AskPriceChangedEvent, BidPriceChangedEvent } from "./types";
import * as G from "./generic"
import * as T from "./types"
import { bullish, bearish } from "indicators"

function local(inputs: string[]) {
    const name = "BTC/EUR";
    const symbol = Symbol.for(name);
    const currency = Symbol.for("EUR");
    console.log(inputs);
    const spots = () => fromFiles({
        paths: inputs,
        symbol
    });
    const account = fromNothing({ currency, spots, initialBalance: 1000 })
    const trendbars = account.trendbars({ symbol, period: ms("15min") })
    trendbars.on("data", e => {
        if(e.timestamp === 1593110700000) {
            account.limitOrder({ id: "1", symbol, tradeSide: "BUY", volume: 0.01, enter: 8244.84, takeProfit: 8254.66, stopLoss: 8232.99}).resume();
        }
    })
    setImmediate(() => {
        // account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, enter: 6613});
        // account.marketOrder({ id: "1", symbol, tradeSide: "BUY", volume: 1, takeProfit: 6614.0});
        // account.marketOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, stopLoss: 6613.0 });
    });
    account.resume(); // consume account events
}

async function spotware() {
    const currency = Symbol.for("EUR");
    const symbol = Symbol.for("BTC/EUR");
    const account = fromSomething({ ...config, currency })
    account.trendbars({ symbol, period: 10000 }).on("data", console.log)
    setTimeout(async () => {
        const stream = account.limitOrder({ id: "1", symbol, tradeSide: "BUY", volume: 0.01, enter: 17000, stopLoss: 16900, takeProfit: 17100, expiresAt: Date.now() + 10000 })
        stream.on("data", e => console.log("---", e));
        stream.on("end", () => console.log("--- END",));
        stream.on("close", () => console.log("--- CLOSE",));
        stream.on("error", err => console.log("--- ERROR", err));
        // setInterval(() => stream.endOrder(), 5000)
    }, 5000)
}

function insideBarLocal(inputs: string[]) {
    const currency = Symbol.for("EUR");
    const initialBalance = 177.59;
    const period = ms("15min");
    const symbol = Symbol.for("BTC/EUR");
    const enterOffset = 0.1;
    const stopLossOffset = 0.4;
    const takeProfitOffset = 0.8;
    const minTrendbarRange = 15;
    const volume = 0.01;
    const expiresIn = ms("30min")
    const spots = () => fromFiles({
        paths: inputs,
        symbol
    });
    const account = fromNothing({ currency, initialBalance, spots })
    insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn })
    account.resume(); // consume account events
}

async function review(output: string, inputs: string[]) {
    const fileStream = multistream(inputs.map(file => fs.createReadStream(file)))
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const orders = new Map<string, any>()
    for await (const line of rl) {
        if (line.indexOf("account") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            if ("id" in data) {
                const id = data.id;
                if (!orders.has(id)) {
                    orders.set(id, {})
                }
                const order = orders.get(id)!
                const fromTimestamp = Math.min(data.timestamp, order.fromTimestamp || Number.MAX_VALUE)
                const toTimestamp = Math.max(data.timestamp, order.toTimestamp || Number.MIN_VALUE)
                const from = new Date(fromTimestamp)
                const to = new Date(toTimestamp)
                const duration = ms(toTimestamp - fromTimestamp)

                delete data.type;
                delete data.timestamp;
                Object.assign(order, data, { fromTimestamp, toTimestamp, from, to, duration })
            }
        }
    }

    console.log(orders)
    const out = fs.createWriteStream(output)
    out.write(`id;type;tradeSide;volume;enter;stopLoss;takeProfit;fromTimestamp;from;toTimestamp;to;expiresTimestamp;expires;duration;entry;exit;price;profitLoss;modified stopLoss;modified takeProfit\n`)
    for (const [_id, data] of orders) {
        out.write(`${data.id};${data.orderType};${data.tradeSide};${data.volume};${data.enter};${data.stopLoss};${data.takeProfit};${data.fromTimestamp};${data.from.toISOString()};${data.toTimestamp};${data.to.toISOString()};${data.expiresAt};${new Date(data.expiresAt).toISOString()};${data.duration};${data.entry || ""};${data.exit || ""};${data.price || ""};${data.profitLoss || ""};${data.modifiedStopLoss || ""};${data.modifiedTakeProfit || ""}\n`)
    }
    out.end();
}
async function temp(output: string, inputs: string[]) {
    type Oppurtunity = {
        orderType: "BUY",
        enter: AskPriceChangedEvent,
        takeProfit: BidPriceChangedEvent,
        stopLoss: BidPriceChangedEvent
    } | {
        orderType: "SELL",
        enter: BidPriceChangedEvent,
        takeProfit: AskPriceChangedEvent,
        stopLoss: AskPriceChangedEvent
    }
    const ranges: {
        id: string
        tradeSide: "SELL" | "BUY"
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
    const emptyRange = (timestamp: T.Timestamp, id: string, tradeSide: T.TradeSide) => ({
            id,
            tradeSide,
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
              ranges.push(emptyRange(e.timestamp, ranges.length.toString(), "BUY"))
          } else if (bearish(first) && engulfed(first, second)) {
              ranges.push(emptyRange(e.timestamp, ranges.length.toString(), "SELL"))
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
            const highBid = range.bid.highs[range.bid.highs.length-1]
            if(!lowAsk || !highBid) {
                continue;
            } else if(lowAsk.timestamp < highBid.timestamp && lowAsk.ask < highBid.bid) {
                const lowBid = range.bid.lows[range.bid.lows.length-1]
                range.oppurtunities.push({orderType: "BUY", enter: lowAsk, takeProfit: highBid, stopLoss: lowBid})
            } else if(highBid.timestamp < lowAsk.timestamp && highBid.bid > lowAsk.ask) {
                const highAsk = range.ask.highs[range.ask.highs.length-1]
                range.oppurtunities.push({orderType: "SELL", enter: highBid, takeProfit: lowAsk, stopLoss: highAsk})
            }
        }
    
        const out = fs.createWriteStream(output)
        out.write(JSON.stringify(ranges, null, 2))
        out.end();
    })
}

if (process.argv[2] === "local") {
    const inputs = process.argv.slice(3)
    local(inputs);
} else if (process.argv[2] === "spotware") {
    spotware();
} else if (process.argv[2] === "insidebar") {
    const inputs = process.argv.slice(3)
    insideBarLocal(inputs);
} else if (process.argv[2] === "temp") {
    const output = process.argv[3];
    const inputs = process.argv.slice(4)
    temp(output, inputs);
} else if (process.argv[2] === "review") {
    const output = process.argv[3];
    const inputs = process.argv.slice(4)
    review(output, inputs);
} else {
    console.log("npm run script local \"input1.log\" \"input2.log\"")
    console.log("npm run script spotware")
    console.log("npm run script insidebar \"input1.log\" \"input2.log\"")
    console.log("npm run script review \"output.csv\" \"input1.log\" \"input2.log\"")
}