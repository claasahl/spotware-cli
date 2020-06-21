import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import { fromSampleData, fromNothing, fromLogFiles } from "./local";
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

function insideBarLocal() {
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
    const spots = () => fromLogFiles({
        paths: [
            "../../Downloads/logs/2020-06-18.log",
            "../../Downloads/logs/2020-06-19.log",
            "../../Downloads/logs/2020-06-20.log"
        ], symbol
    });
    const account = fromNothing({ currency, initialBalance, spots })
    insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn })
    account.resume(); // consume account events
}
insideBarLocal;

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
    const ranges = new Map<number, {
        id: string
        ask: {
            high: AskPriceChangedEvent
            low: AskPriceChangedEvent
        },
        bid: {
            high: BidPriceChangedEvent
            low: BidPriceChangedEvent
        }
    }>()
    for await (const line of rl) {
        if (line.indexOf("account") >= 0 && line.indexOf("\"CREATED\"") >= 0) {
            console.log(line)
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            if ("timestamp" in data) {
                const { timestamp } = data;
                if (!ranges.has(timestamp)) {
                    ranges.set(timestamp, {
                        id: data.id,
                        ask: {
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
            }
        } else if (line.indexOf("spotPrices:") >= 0 && line.indexOf("\"ASK_PRICE_CHANGED\"") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            for(const [key, value] of ranges) {
                if(data.timestamp >= key && data.timestamp < key+range) {
                    if(value.ask.high.ask < data.ask) {
                        console.log("new high", line)
                        value.ask.high = data;
                    }
                    if(value.ask.low.ask > data.ask) {
                        console.log("now low", line)
                        value.ask.low = data;
                    }
                    break;
                }
            }
        } else if (line.indexOf("spotPrices:") >= 0 && line.indexOf("\"BID_PRICE_CHANGED\"") >= 0) {
            const logEntry = /({.*})/.exec(line);
            const data = JSON.parse(logEntry![1])
            for(const [key, value] of ranges) {
                if(data.timestamp >= key && data.timestamp < key+range) {
                    if(value.bid.high.bid < data.bid) {
                        console.log("new high", line)
                        value.bid.high = data;
                    }
                    if(value.bid.low.bid > data.bid) {
                        console.log("new low", line)
                        value.bid.low = data;
                    }
                    break;
                }
            }
        }
    }

    const out = fs.createWriteStream(output)
    out.write(`id;ask high;ask low;bid high;bid low\n`)
    for (const [_id, data] of ranges) {
        out.write(`${data.id};${data.ask.high.ask};${data.ask.low.ask};${data.bid.high.bid};${data.bid.low.bid}\n`)
    }
    out.end();
}

if (process.argv[2] === "local") {
    local();
} else if (process.argv[2] === "spotware") {
    spotware();
} else if (process.argv[2] === "insidebar") {
    insideBarLocal();
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
    console.log("npm run script insidebar")
    console.log("npm run script review \"output.csv\" \"input1.log\" \"input2.log\"")
}