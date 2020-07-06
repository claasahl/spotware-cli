import fs from "fs";
import {Range} from "./oppurtunities"
import { BidPriceChangedEvent, AskPriceChangedEvent } from "../services/types";

interface Flattened {
    tb0_open: number;
    tb0_high: number;
    tb0_low: number;
    tb0_close: number;
    tb0_timestamp: number;
    tb1_open: number;
    tb1_high: number;
    tb1_low: number;
    tb1_close: number;
    tb1_timestamp: number;
    
    opp0_type: "BUY" | "SELL";
    opp0_enter?: number;
    opp0_high?: number;
    opp0_low?: number;
    opp1_type: "BUY" | "SELL";
    opp1_enter?: number;
    opp1_high?: number;
    opp1_low?: number;
}

function price(price: BidPriceChangedEvent | AskPriceChangedEvent): number | undefined {
    if(price.type === "ASK_PRICE_CHANGED") {
        return price.ask;
    } else if(price.type === "BID_PRICE_CHANGED") {
        return price.bid;
    }
    return undefined
}

function flatten(r: Range): Flattened {
    return {
        tb0_open:r.trendbars[0].open,
        tb0_high:r.trendbars[0].high,
        tb0_low:r.trendbars[0].low,
        tb0_close:r.trendbars[0].close,
        tb0_timestamp:r.trendbars[0].timestamp,
        tb1_open:r.trendbars[1].open,
        tb1_high:r.trendbars[1].high,
        tb1_low:r.trendbars[1].low,
        tb1_close:r.trendbars[1].close,
        tb1_timestamp:r.trendbars[1].timestamp,
        
        opp0_type:r.oppurtunities[0].orderType,
        opp0_enter:price(r.oppurtunities[0].enter),
        opp0_high:price(r.oppurtunities[0].high),
        opp0_low:price(r.oppurtunities[0].low),
        opp1_type:r.oppurtunities[1].orderType,
        opp1_enter:price(r.oppurtunities[1].enter),
        opp1_high:price(r.oppurtunities[1].high),
        opp1_low:price(r.oppurtunities[1].low)
    }
}

function header(): string {
    return "tb0_open;tb0_high;tb0_low;tb0_close;tb0_timestamp;tb1_open;tb1_high;tb1_low;tb1_close;tb1_timestamp;;opp0_type;opp0_enter;opp0_high;opp0_low;opp1_type;opp1_enter;opp1_high;opp1_low"
}

function row(r: Flattened): string {
    return `${r.tb0_open};${r.tb0_high};${r.tb0_low};${r.tb0_close};${r.tb0_timestamp};${r.tb1_open};${r.tb1_high};${r.tb1_low};${r.tb1_close};${r.tb1_timestamp};;${r.opp0_type};${r.opp0_enter};${r.opp0_high};${r.opp0_low};${r.opp1_type};${r.opp1_enter};${r.opp1_high};${r.opp1_low};`
}

export default async function main(output: string, input: string) {
    const ranges = JSON.parse((await fs.promises.readFile(input)).toString()) as Range[];
    const rows: string[] = ranges
        .filter(r => r.oppurtunities.length === 2)
        .map(r => flatten(r))
        .map(r => row(r))
    await fs.promises.writeFile(output, [header(), ...rows].join("\n"))
}