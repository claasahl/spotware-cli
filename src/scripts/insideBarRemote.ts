import { insideBarMomentumStrategy } from "../services/insideBarMomentumStrategy";
import config from "../config";
import { fromSomething } from "../services/spotware/account";
import { periodToMillis } from "../utils";
import {execFile} from "child_process";
import debug from "debug"

function header() {
    execFile("git", ["rev-parse", "HEAD"], (_error, stdout, _stderr) => {
        debug("CONFIG")("%j", { config, git: stdout, env: process.env })
    })
}

export default function main(currencyName: string = "EUR") {
    header();
    const currency = Symbol.for(currencyName);
    const symbol = Symbol.for(config.symbol)
    const account = fromSomething({ currency, ...config })
    const period = periodToMillis(config.period);
    const expiresIn = config.expirationOffset;
    insideBarMomentumStrategy({ ...config, account, symbol, period, expiresIn })
    account.resume(); // consume account events
}