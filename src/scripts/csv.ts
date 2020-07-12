import fs from "fs";
import {Range, Oppurtunity} from "./oppurtunities"

interface Flattened {
    tb0_open: number;
    tb0_high: number;
    tb0_low: number;
    tb0_close: number;
    tb0_timestamp: number;
    tb0_range: number;
    tb1_open: number;
    tb1_high: number;
    tb1_low: number;
    tb1_close: number;
    tb1_timestamp: number;
    tb1_range: number;
    
    opp_type: "BUY" | "SELL";
    opp_enter: number;
    opp_high: number;
    opp_low: number;

    rel_enter: number;
    rel_high: number;
    rel_low: number;
}

function enterPrice(o: Oppurtunity): number {
    if(o.orderType === "BUY") {
        return o.enter.ask
    } else if(o.orderType === "SELL") {
        return o.enter.bid
    }
    return 0;
}
function lowPrice(o: Oppurtunity): number {
    if(o.orderType === "BUY") {
        return o.low.bid
    } else if(o.orderType === "SELL") {
        return o.low.ask
    }
    return 0;
}
function highPrice(o: Oppurtunity): number {
    if(o.orderType === "BUY") {
        return o.high.bid
    } else if(o.orderType === "SELL") {
        return o.high.ask
    }
    return 0;
}

function flatten(r: Range, opp: Oppurtunity): Flattened {
    const opp_enter = enterPrice(opp)
    const opp_high = highPrice(opp)
    const opp_low = lowPrice(opp)
    const tb0_high = r.trendbars[0].high
    const tb0_range = Math.abs(tb0_high - r.trendbars[0].low)
    const tb1_range = Math.abs(r.trendbars[1].high - r.trendbars[1].low)

    return {
        tb0_open:r.trendbars[0].open,
        tb0_high,
        tb0_low:r.trendbars[0].low,
        tb0_close:r.trendbars[0].close,
        tb0_timestamp:r.trendbars[0].timestamp,
        tb0_range,
        tb1_open:r.trendbars[1].open,
        tb1_high:r.trendbars[1].high,
        tb1_low:r.trendbars[1].low,
        tb1_close:r.trendbars[1].close,
        tb1_timestamp:r.trendbars[1].timestamp,
        tb1_range,
        
        opp_type:opp.orderType,
        opp_enter,
        opp_high,
        opp_low,

        rel_enter: (opp_enter - tb0_high) / tb0_range,
        rel_high: (opp_high - tb0_high) / tb0_range,
        rel_low: (opp_low - tb0_high) / tb0_range,
    }
}

function header(): string {
    return "tb0_open;tb0_high;tb0_low;tb0_close;tb0_timestamp;tb0_range;tb1_open;tb1_high;tb1_low;tb1_close;tb1_timestamp;tb1_range;opp0_type;opp0_enter;opp0_high;opp0_low;rel_enter;rel_high;rel_low"
}

function row(r: Flattened): string {
    return `${r.tb0_open};${r.tb0_high};${r.tb0_low};${r.tb0_close};${new Date(r.tb0_timestamp).toISOString()};${r.tb0_range};${r.tb1_open};${r.tb1_high};${r.tb1_low};${r.tb1_close};${new Date(r.tb1_timestamp).toISOString()};${r.tb1_range};${r.opp_type};${r.opp_enter};${r.opp_high};${r.opp_low};${r.rel_enter};${r.rel_high};${r.rel_low};`
}

export default async function main(output: string, input: string) {
    const ranges = JSON.parse((await fs.promises.readFile(input)).toString()) as Range[];
    const rows: string[] = []
    for(const range of ranges) {
        for(const opp of range.oppurtunities) {
            rows.push(row(flatten(range, opp)))
        }
    }
    await fs.promises.writeFile(output, [header(), ...rows].join("\n"))
}