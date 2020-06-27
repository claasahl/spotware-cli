import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import { fromNothing, fromFiles } from "./local";
import config from "../config";
import { fromSomething } from "./spotware/account";
import ms from "ms";
import fs from "fs"
import readline from "readline";
import { obj as multistream } from "multistream";
import { AskPriceChangedEvent, BidPriceChangedEvent } from "./types";

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
        if(e.timestamp === 1592934300000) {
            account.limitOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, enter: 8565.43, stopLoss: 8565.43001, takeProfit: 8550.04}).resume();
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
    const fileStream = multistream(inputs.map(file => fs.createReadStream(file)))
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const range = ms("30min");
    type Oppurtunity = {orderType: "BUY", enter: AskPriceChangedEvent, exit: BidPriceChangedEvent} | {orderType: "SELL", enter: BidPriceChangedEvent, exit: AskPriceChangedEvent}
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
            direction?: "bullish" | "bearish"
            points?: number
        },
        bid: {
            series: (BidPriceChangedEvent & { hl: "high" | "low", date: Date })[]
            highs: (BidPriceChangedEvent & { date: Date })[]
            lows:( BidPriceChangedEvent & { date: Date })[]
            direction?: "bullish" | "bearish"
            points?: number
        },
        oppurtunities: Oppurtunity[]
    }[] = []
    for await (const line of rl) {
        if (line.indexOf("account") >= 0 && line.indexOf("\"CREATED\"") >= 0) {
            console.log(line)
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            if ("timestamp" in data) {
                const { timestamp } = data;
                ranges.push({
                    id: data.id,
                    tradeSide: data.tradeSide,
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
            }
        } else if (line.indexOf("spotPrices:") >= 0 && line.indexOf("\"ASK_PRICE_CHANGED\"") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            for (const range of ranges) {
                if (data.timestamp >= range.fromTimestamp && data.timestamp < range.toTimestamp) {
                    if (range.ask.highs.length === 0 || range.ask.highs[range.ask.highs.length-1].ask < data.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "high") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...data, hl: "high", date: new Date(data.timestamp) })
                        range.ask.highs.push({ ...data, date: new Date(data.timestamp) })
                    }
                    if (range.ask.lows.length === 0 || range.ask.lows[range.ask.lows.length-1].ask > data.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "low") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...data, hl: "low", date: new Date(data.timestamp) })
                        range.ask.lows.push({ ...data, date: new Date(data.timestamp) })
                    }
                    if(range.tradeSide === "SELL") {
                        const len = range.ask.series.length
                        const prices = range.ask.series;
                        if(len >= 2 && prices[len-1].hl === "low" && prices[len-2].hl === "high") {
                            range.ask.direction = "bearish"
                            range.ask.points = prices[len-2].ask-prices[len-1].ask
                        }
                    }
                    break;
                }
            }
        } else if (line.indexOf("spotPrices:") >= 0 && line.indexOf("\"BID_PRICE_CHANGED\"") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            for (const range of ranges) {
                if (data.timestamp >= range.fromTimestamp && data.timestamp < range.toTimestamp) {
                    if (range.bid.highs.length === 0 || range.bid.highs[range.bid.highs.length-1].bid < data.bid) {
                        console.log("-----> high", data)
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "high") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...data, hl: "high", date: new Date(data.timestamp) })
                        range.bid.highs.push({ ...data, date: new Date(data.timestamp) })
                    }
                    if (range.bid.lows.length === 0 || range.bid.lows[range.bid.lows.length-1].bid > data.bid) {
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "low") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...data, hl: "low", date: new Date(data.timestamp) })
                        range.bid.lows.push({ ...data, hl: "low", date: new Date(data.timestamp) })
                    }
                    if(range.tradeSide === "BUY") {
                        const len = range.bid.series.length
                        const prices = range.bid.series;
                        if(len >= 2 && prices[len-1].hl === "high" && prices[len-2].hl === "low") {
                            range.bid.direction = "bullish"
                            range.bid.points = prices[len-1].bid-prices[len-2].bid
                        }
                    }
                    break;
                }
            }
        }
    }

    for(const range of ranges) {
        const lowAsk = range.ask.lows[range.ask.lows.length-1]
        const highBid = range.bid.highs[range.bid.highs.length-1]
        if(lowAsk.timestamp < highBid.timestamp && lowAsk.ask < highBid.bid) {
            range.oppurtunities.push({orderType: "BUY", enter: lowAsk, exit: highBid})
        } else if(highBid.timestamp < lowAsk.timestamp && highBid.bid > lowAsk.ask) {
            range.oppurtunities.push({orderType: "SELL", enter: highBid, exit: lowAsk})
        }
    }

    const out = fs.createWriteStream(output)
    out.write(JSON.stringify(ranges, null, 2))
    out.end();
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