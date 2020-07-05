import { insideBarMomentumStrategy } from "../services/insideBarMomentumStrategy";
import config from "../config";
import { fromSomething } from "../services/spotware/account";
import { periodToMillis } from "../utils";

export default function main(currencyName: string = "EUR") {
    const currency = Symbol.for(currencyName);
    const symbol = Symbol.for(config.symbol)
    const account = fromSomething({ currency, ...config })
    const period = periodToMillis(config.period);
    const expiresIn = config.expirationOffset;
    insideBarMomentumStrategy({ ...config, account, symbol, period, expiresIn })
    account.resume(); // consume account events
}