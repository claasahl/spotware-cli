import {promises as fs} from "fs"
import {isArray} from "util"
import { AccountStream } from "../account";
import { DebugSpotPricesStream, SpotPricesStream } from "../spotPrices";
import { Symbol } from "../types";
import { OrderStream } from "../order";

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

class LocalAccountStream extends AccountStream {
    private readonly path: string;
    constructor(path: string) {
        super();
        this.path = path;
    }
    order(_symbol: Symbol): OrderStream {
        throw new Error("not implemented");
    }
    spotPrices(symbol: Symbol): SpotPricesStream {
        return spotPrices(this.path, symbol);
    }
}

const name = "BTC/EUR"
const symbol = Symbol(name)
const services = new LocalAccountStream("./store/samples.json");
const spots = services.spotPrices(symbol)
spots.on("ask", console.log);