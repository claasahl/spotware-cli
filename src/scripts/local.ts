import { fromNothing, fromFiles } from "../services/local";
import ms from "ms";

export default function main(inputs: string[], currencyName: string = "EUR", symbolName: string = "BTC/EUR") {
    const symbol = Symbol.for(symbolName);
    const currency = Symbol.for(currencyName);
    console.log(inputs);
    const spots = () => fromFiles({
        paths: inputs,
        symbol
    });
    const account = fromNothing({ currency, spots, initialBalance: 1000 })
    const trendbars = account.trendbars({ symbol, period: ms("15min") })
    trendbars.on("data", e => {
        if(e.timestamp === 1593110700000) {
            // account.limitOrder({ id: "1", symbol, tradeSide: "BUY", volume: 0.01, enter: 8248.4, takeProfit: 8254.66, stopLoss: 8232.99}).resume();
            account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 0.01, enter: 8251.16, takeProfit: 8244.84, stopLoss: 8271.78 + 0.01}).resume();
        }
    })
    setImmediate(() => {
        // account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, enter: 6613});
        // account.marketOrder({ id: "1", symbol, tradeSide: "BUY", volume: 1, takeProfit: 6614.0});
        // account.marketOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, stopLoss: 6613.0 });
    });
    account.resume(); // consume account events
}