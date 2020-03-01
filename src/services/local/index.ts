import assert from "assert"
import { BalanceChangedEvent, EquityChangedEvent, DebugAccountStream, OrderEvent } from "../account";
import { DebugSpotPricesStream, SpotPricesStream, AskPriceChangedEvent, BidPriceChangedEvent, PriceChangedEvent } from "../spotPrices";
import { Symbol, Currency, Price, Timestamp } from "../types";
import { OrderStream, DebugOrderStream } from "../order";

function* test(): Generator<AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent, void, unknown> {
    yield { "ask": 6611.79, "timestamp": 1577663999771 };
    yield { "bid": 6612.03, "timestamp": 1577663999425 };
    yield { "bid": 6612.28, "timestamp": 1577663999110 };
    yield { "ask": 6612.52, "timestamp": 1577663998928 };
    yield { "bid": 6612.73, "timestamp": 1577663998447 };
    yield { "bid": 6613.18, "timestamp": 1577663998021 };
    yield { "ask": 6613.21, "timestamp": 1577663997680 };
    yield { "bid": 6613.11, "timestamp": 1577663997264 };
    yield { "bid": 6613.18, "timestamp": 1577663997026 };
    yield { "bid": 6613.21, "timestamp": 1577663996609 };
    yield { "ask": 6613.24, "timestamp": 1577663995996 };
    yield { "bid": 6613.98, "timestamp": 1577663995829 };
    yield { "bid": 6614.08, "timestamp": 1577663995601 };
    yield { "ask": 6613, "bid": 6613.91, "timestamp": 1577663995198 };
    yield { "ask": 6613, "bid": 6613.17, "timestamp": 1577663994564 };
    yield { "ask": 6613, "bid": 6613.14, "timestamp": 1577663994182 };
    yield { "bid": 6613.21, "timestamp": 1577663993987 };
    yield { "ask": 6612.72, "timestamp": 1577663993516 };
}

function emitSpotPrices(stream: DebugSpotPricesStream, e: AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent): void {
    if ("ask" in e && !("bid" in e)) {
        stream.emitAsk({ ask: e.ask, timestamp: e.timestamp })
    } else if (!("ask" in e) && "bid" in e) {
        stream.emitBid({ bid: e.bid, timestamp: e.timestamp })
    } else if ("ask" in e && "bid" in e) {
        stream.emitAsk({ ask: e.ask, timestamp: e.timestamp })
        stream.emitBid({ bid: e.bid, timestamp: e.timestamp })
        stream.emitPrice({ ask: e.ask, bid: e.bid, timestamp: e.timestamp })
    }
    setImmediate(() => stream.emit("next"))
}

function spotPrices(_path: string, symbol: Symbol): SpotPricesStream {
    function emitNext() {
        const a = data.next();
        if (a.value) {
            emitSpotPrices(stream, a.value)
        }
    }
    const data = test();
    const stream = new DebugSpotPricesStream(symbol);
    setImmediate(() => {
        stream.on("next", emitNext)
        emitNext()
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
        const e: OrderEvent = { timestamp: Date.now() }
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
        this.emitBalance(e)
    }
    private updateEquity(timestamp: Timestamp) {
        const e: EquityChangedEvent = { equity: this.equity, timestamp }
        this.emitEquity(e)
    }
}

const name = "BTC/EUR"
const symbol = Symbol.for(name)
const account = new LocalAccountStream(Symbol.for("EUR"), 1000, "./store/samples.json");
setImmediate(() => {
    account.spotPrices(symbol)
})
setImmediate(() => {
    account.order(symbol)
})