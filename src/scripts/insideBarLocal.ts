import { insideBarMomentumStrategy } from "../services/insideBarMomentumStrategy";
import { fromNothing, fromFiles } from "../services/local";
import ms from "ms";

export default function main(inputs: string[], currencyName: string = "EUR", symbolName: string = "BTC/EUR") {
    const currency = Symbol.for(currencyName);
    const initialBalance = 177.59;
    const period = ms("15min");
    const symbol = Symbol.for(symbolName);
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