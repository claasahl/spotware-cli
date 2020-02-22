import {promises as fs} from "fs"
import {isArray} from "util"
import { DebugAccountStream, AccountStream } from "../account";
import { DebugSpotPricesStream, SpotPricesStream } from "../spotPrices";
import { TrendbarsStream } from "../trendbars";
import { Period, Symbol } from "../types";


interface Services {
    account(): AccountStream,
    spotPrices(symbol: Symbol): SpotPricesStream,
    trendbar(symbol: Symbol, period: Period): TrendbarsStream
}

function account(): AccountStream {
    return new DebugAccountStream();
}

function emitSpotPrices(stream: DebugSpotPricesStream, events: any[]): void {
    events.forEach(e => {
        setImmediate(() => {
            if(e.timestamp && e.ask && !e.bid) {
                stream.emitAsk({price: e.ask, timestamp: e.timestamp})
            } else if(e.timestamp && !e.ask && e.bid) {
                stream.emitBid({price: e.bid, timestamp: e.timestamp})
            } else if(e.timestamp && e.ask && e.bid) {
                stream.emitAsk({price: e.ask, timestamp: e.timestamp})
                stream.emitBid({price: e.bid, timestamp: e.timestamp})
                stream.emitPrice({ask: e.ask, bid: e.bid, timestamp: e.timestamp})
            }
        })
    })
}

function spotPrices(path: string, symbol: Symbol): SpotPricesStream {
    const stream = new DebugSpotPricesStream(symbol);
    setImmediate(async () => {
        const data = await fs.readFile(path)
        const events = JSON.parse(data.toString())
        if(isArray(events)) {
            emitSpotPrices(stream, events)      
        }
    })
    return stream;
}

function trendbar(symbol: Symbol, period: Period): TrendbarsStream {
    return new TrendbarsStream(symbol, period);
}

function create(path: string): Services {    
    return {
        account,
        spotPrices: (symbol: Symbol) => spotPrices(path, symbol),
        trendbar
    }
}

const name = "BTC/EUR"
const symbol = Symbol(name)
const services = create("./store/samples.json");
const spots = services.spotPrices(symbol)
spots.on("ask", console.log);