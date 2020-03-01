import { promises as fs } from "fs"
import assert from "assert"
import { isArray } from "util"
import { BalanceChangedEvent, EquityChangedEvent, DebugAccountStream, OrderEvent } from "../account";
import { DebugSpotPricesStream, SpotPricesStream } from "../spotPrices";
import { Symbol, Currency, Price, Timestamp } from "../types";
import { OrderStream, DebugOrderStream } from "../order";

function emitSpotPrices(stream: DebugSpotPricesStream, events: any[]): void {
    events.forEach(e => {
        setImmediate(() => {
            if (e.timestamp && e.ask && !e.bid) {
                stream.emitAsk({ price: e.ask, timestamp: e.timestamp })
            } else if (e.timestamp && !e.ask && e.bid) {
                stream.emitBid({ price: e.bid, timestamp: e.timestamp })
            } else if (e.timestamp && e.ask && e.bid) {
                stream.emitAsk({ price: e.ask, timestamp: e.timestamp })
                stream.emitBid({ price: e.bid, timestamp: e.timestamp })
                stream.emitPrice({ ask: e.ask, bid: e.bid, timestamp: e.timestamp })
            }
        })
    })
}

function spotPrices(path: string, symbol: Symbol): SpotPricesStream {
    const stream = new DebugSpotPricesStream(symbol);
    setImmediate(async () => {
        const data = await fs.readFile(path)
        const events = JSON.parse(data.toString())
        if (isArray(events)) {
            emitSpotPrices(stream, events)
        }
    })
    return stream;
}

function includesCurrency(symbol: Symbol, currency: Currency): boolean {
    const matches = currency.toString().match(/Symbol\((.*)\)/)
    assert.ok(matches, `couldn't extract name of currency ${currency.toString()}`)
    assert.strictEqual(matches?.length, 2, `there should have been exactly two matches, but ${matches?.length} was/were found`)
    return symbol.toString().includes(name)
}

class LocalAccountStream extends DebugAccountStream {
    private readonly path: string;
    private balance: Price = 0;
    private equity: Price = 0;
    constructor(currency: Currency, initialBalance: Price, path: string) {
        super(currency);
        this.path = path;
        this.balance = initialBalance;
        this.equity = initialBalance;
        this.updateBalance(Date.now());
    }
    order(symbol: Symbol): OrderStream {
        if (!includesCurrency(symbol, this.currency)) {
            throw new Error(`symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`);
        }
        const stream = new DebugOrderStream(new Date().toISOString(), symbol)
        const e: OrderEvent = {timestamp: Date.now()}
        this.emitOrder(e)
        return stream;
    }
    spotPrices(symbol: Symbol): SpotPricesStream {
        if (!includesCurrency(symbol, this.currency)) {
            throw new Error(`symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`);
        }
        const stream = spotPrices(this.path, symbol);
        stream.on("ask", e => this.updateEquity(e.timestamp))
        stream.on("bid", e => this.updateEquity(e.timestamp))
        return stream;
    }

    private updateBalance(timestamp: Timestamp) {
        const e: BalanceChangedEvent = { balance: this.balance, timestamp }
        setImmediate(() => this.emitBalance(e))
    }
    private updateEquity(timestamp: Timestamp) {
        const e: EquityChangedEvent = { equity: this.equity, timestamp }
        setImmediate(() => this.emitEquity(e))
    }
}

const name = "BTC/EUR"
const symbol = Symbol.for(name)
const account = new LocalAccountStream(Symbol.for("EUR"), 1000, "./store/samples.json");
const spots = account.spotPrices(symbol)
spots.on("ask", console.log);
const order = account.order(symbol)
order.on("end", console.log)