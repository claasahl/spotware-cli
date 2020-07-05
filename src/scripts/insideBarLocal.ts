import { insideBarMomentumStrategy } from "../services/insideBarMomentumStrategy";
import { fromNothing, fromFiles } from "../services/local";
import ms from "ms";

export default function main(inputs: string[], period: string, expiresIn: string, currencyName: string, symbolName: string) {
    const currency = Symbol.for(currencyName);
    const initialBalance = 177.59;
    const symbol = Symbol.for(symbolName);
    const enterOffset = 0.1;
    const stopLossOffset = 0.4;
    const takeProfitOffset = 0.8;
    const minTrendbarRange = 15;
    const volume = 0.01;
    const spots = () => fromFiles({
        paths: inputs,
        symbol
    });
    const account = fromNothing({ currency, initialBalance, spots })
    insideBarMomentumStrategy({
        account, 
        period: ms(period), 
        symbol, 
        enterOffset, 
        stopLossOffset, 
        takeProfitOffset, 
        minTrendbarRange, 
        volume, 
        expiresIn: ms(expiresIn)
    })
    account.resume(); // consume account events
}