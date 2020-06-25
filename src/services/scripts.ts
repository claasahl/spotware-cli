import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import { fromSampleData, fromNothing, fromFiles } from "./local";
import config from "../config";
import { fromSomething } from "./spotware/account";
import ms from "ms";
import fs from "fs"
import readline from "readline";
import { obj as multistream } from "multistream";
import { AskPriceChangedEvent, BidPriceChangedEvent } from "./types";

function local() {
    const name = "BTC/EUR";
    const symbol = Symbol.for(name);
    const currency = Symbol.for("EUR");
    const account = fromNothing({ currency, spots: fromSampleData, initialBalance: 1000 })
    setImmediate(() => {
        account.trendbars({ symbol, period: 2000 });
    });
    setImmediate(() => {
        // account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, enter: 6613});
        // account.marketOrder({ id: "1", symbol, tradeSide: "BUY", volume: 1, takeProfit: 6614.0});
        account.marketOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, stopLoss: 6613.0 });
    });
}

async function spotware() {
    const currency = Symbol.for("EUR");
    const symbol = Symbol.for("BTC/EUR");
    const account = fromSomething({ ...config, currency })
    account.trendbars({ symbol, period: 10000 }).on("data", console.log)
    setTimeout(async () => {
        const stream = account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 10, enter: 7000, stopLoss: 7100, takeProfit: 6900, expiresAt: Date.now() + 100000 })
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
    out.write(`id;type;tradeSide;volume;enter;stopLoss;takeProfit;fromTimestamp;from;toTimestamp;to;expiresTimestamp;expires;duration;entry;exit;price;profitLoss\n`)
    for (const [_id, data] of orders) {
        out.write(`${data.id};${data.orderType};${data.tradeSide};${data.volume};${data.enter};${data.stopLoss};${data.takeProfit};${data.fromTimestamp};${data.from.toISOString()};${data.toTimestamp};${data.to.toISOString()};${data.expiresAt};${new Date(data.expiresAt).toISOString()};${data.duration};${data.entry || ""};${data.exit || ""};${data.price || ""};${data.profitLoss || ""}\n`)
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
    const ranges: {
        id: string
        tradeSide: "SELL" | "BUY"
        fromTimestamp: number,
        from: Date,
        toTimestamp: number,
        to: Date,
        ask: {
            series: (AskPriceChangedEvent & { hl: "high" | "low" })[]
            high: AskPriceChangedEvent
            low: AskPriceChangedEvent
            direction?: "bullish" | "bearish"
            points?: number
        },
        bid: {
            series: (BidPriceChangedEvent & { hl: "high" | "low" })[]
            high: BidPriceChangedEvent
            low: BidPriceChangedEvent
            direction?: "bullish" | "bearish"
            points?: number
        },
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
                        high: {
                            timestamp: 0,
                            type: "ASK_PRICE_CHANGED",
                            ask: Number.MIN_VALUE
                        },
                        low: {
                            timestamp: 0,
                            type: "ASK_PRICE_CHANGED",
                            ask: Number.MAX_VALUE
                        }
                    },
                    bid: {
                        series: [],
                        high: {
                            timestamp: 0,
                            type: "BID_PRICE_CHANGED",
                            bid: Number.MIN_VALUE
                        },
                        low: {
                            timestamp: 0,
                            type: "BID_PRICE_CHANGED",
                            bid: Number.MAX_VALUE
                        }
                    }
                })
            }
        } else if (line.indexOf("spotPrices:") >= 0 && line.indexOf("\"ASK_PRICE_CHANGED\"") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            for (const range of ranges) {
                if (data.timestamp >= range.fromTimestamp && data.timestamp < range.toTimestamp) {
                    if (range.ask.high.ask < data.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "high") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...data, hl: "high" })
                        range.ask.high = data;
                    }
                    if (range.ask.low.ask > data.ask) {
                        if(range.ask.series.length > 0 && range.ask.series[range.ask.series.length-1].hl === "low") {
                            range.ask.series.pop()
                        }
                        range.ask.series.push({ ...data, hl: "low" })
                        range.ask.low = data;
                    }
                    if(range.tradeSide === "SELL") {
                        const len = range.bid.series.length
                        const prices = range.bid.series;
                        if(len >= 2 && prices[len-1].hl === "low" && prices[len-2].hl === "high") {
                            range.bid.direction = "bearish"
                            range.bid.points = prices[len-2].bid-prices[len-1].bid
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
                    if (range.bid.high.bid < data.bid) {
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "high") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...data, hl: "high" })
                        range.bid.high = data;
                    }
                    if (range.bid.low.bid > data.bid) {
                        if(range.bid.series.length > 0 && range.bid.series[range.bid.series.length-1].hl === "low") {
                            range.bid.series.pop()
                        }
                        range.bid.series.push({ ...data, hl: "low" })
                        range.bid.low = data;
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

    const out = fs.createWriteStream(output)
    out.write(JSON.stringify(ranges, null, 2))
    out.end();
}

if (process.argv[2] === "local") {
    local();
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
    console.log("npm run script local")
    console.log("npm run script spotware")
    console.log("npm run script insidebar \"input1.log\" \"input2.log\"")
    console.log("npm run script review \"output.csv\" \"input1.log\" \"input2.log\"")
}