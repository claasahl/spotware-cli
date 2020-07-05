import config from "../config";
import { fromSomething } from "../services/spotware/account";

export default async function main(currencyName: string = "EUR", symbolName: string = "BTC/EUR") {
    const currency = Symbol.for(currencyName);
    const symbol = Symbol.for(symbolName);
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