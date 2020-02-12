import { EventEmitter } from "events";
import { bearish, bullish, range } from "indicators";
import { Price, Timestamp, TradeSide, Symbol, EURUSD } from "./types"
import { SpotPriceStream } from "./spotPrice";
import { TrendbarEvent, TrendbarStream } from "./trendbar";
import { AccountStream } from "./account";
import { OrderStream, OrderAcceptedEvent, OrderClosedEvent, OrderEndEvent } from "./order";

// API should be async, stream of events
// an Order has a lifecyle which can be represented through events (e.g. a "mini stream")
// a Symbol (e.g. "EURUSD") experiences price changes, which can be represented through events


export namespace InsideBarMomentumStrategyStream {
    export interface EngulfedTrenbarEvent {
        symbol: Symbol
        tradeSide: TradeSide
        enter: Price
        takeProfit: Price
        stopLoss: Price
        timestamp: Timestamp
    }

    export interface Options {
        enterOffset: number
        stopLossOffset: number
        takeProfitOffset: number
    }

    export const DEFAULT_OPTIONS: Options = {
        enterOffset: 0.1,
        stopLossOffset: 0.4,
        takeProfitOffset: 0.8
    }
    export interface InsideBarMomentumStrategyStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "bearish", listener: (e: EngulfedTrenbarEvent) => void): this;
        addListener(event: "bullish", listener: (e: EngulfedTrenbarEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "bearish", listener: (e: EngulfedTrenbarEvent) => void): this;
        on(event: "bullish", listener: (e: EngulfedTrenbarEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "bearish", listener: (e: EngulfedTrenbarEvent) => void): this;
        once(event: "bullish", listener: (e: EngulfedTrenbarEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "bearish", listener: (e: EngulfedTrenbarEvent) => void): this;
        prependListener(event: "bullish", listener: (e: EngulfedTrenbarEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "bearish", listener: (e: EngulfedTrenbarEvent) => void): this;
        prependOnceListener(event: "bullish", listener: (e: EngulfedTrenbarEvent) => void): this;
    }

    function engulfed(barPrev: TrendbarEvent, barCurr: TrendbarEvent): boolean {
        const upperPrev = barPrev.high;
        const lowerPrev = barPrev.low;
        const upperCurr = barCurr.high;
        const lowerCurr = barCurr.low;
        return (
            (upperPrev >= upperCurr && lowerPrev < lowerCurr) ||
            (upperPrev > upperCurr && lowerPrev <= lowerCurr)
        );
    }

    function roundPrice(price: number): number {
        return Math.round(price * 100) / 100;
    }

    export function from(account: AccountStream, options: Partial<Options> = {}): InsideBarMomentumStrategyStream {
        const stream = trendbarStreamFrom(account);
        const emitter = new EventEmitter();
        const { enterOffset, stopLossOffset, takeProfitOffset } = Object.assign(options, DEFAULT_OPTIONS)
        let prevBar: TrendbarEvent | null = null
        stream.on("trendbar", currBar => {
            const prev = prevBar;
            prevBar = currBar
            if (prev && engulfed(prev, currBar)) {
                const timestamp = Date.now();
                const r = range(currBar);
                if (bearish(prev)) {
                    const event: EngulfedTrenbarEvent = {
                        symbol: currBar.symbol,
                        tradeSide: "SELL",
                        enter: roundPrice(currBar.low - r * enterOffset),
                        stopLoss: roundPrice(currBar.low + r * stopLossOffset),
                        takeProfit: roundPrice(currBar.low - r * takeProfitOffset),
                        timestamp
                    }
                    setImmediate(() => emitter.emit("bearish", event))
                }
                if (bullish(prev)) {
                    const event: EngulfedTrenbarEvent = {
                        symbol: currBar.symbol,
                        tradeSide: "BUY",
                        enter: roundPrice(currBar.high + r * enterOffset),
                        stopLoss: roundPrice(currBar.high - r * stopLossOffset),
                        takeProfit: roundPrice(currBar.high + r * takeProfitOffset),
                        timestamp
                    }
                    setImmediate(() => emitter.emit("bullish", event))
                }
            }
        })

        const orders: Map<string, OrderStream> = new Map();
        function signal(e: EngulfedTrenbarEvent): void {
            orders.forEach(o => o.end())

            const order = account.order(e.symbol);
            orders.set(order.id, order);
            order.on("end", e => {
                console.log("bye", order.id, e)
                orders.delete(order.id);
            })
        }

        emitter.on("bearish", (e: EngulfedTrenbarEvent) => {
            console.log("---")
            signal(e)
        })
        emitter.on("bullish", (e: EngulfedTrenbarEvent) => {
            console.log("+++")
            signal(e);
        })
        return emitter;
    }
}

export function spotPriceStreamFrom(_stream: AccountStream, _symbol: Symbol): SpotPriceStream {
    return new EventEmitter();
}

export function trendbarStreamFrom(_stream: AccountStream, _symbol: Symbol): TrendbarStream;
export function trendbarStreamFrom(_stream: SpotPriceStream): TrendbarStream;
export function trendbarStreamFrom(_stream: AccountStream | SpotPriceStream, _symbol?: Symbol): TrendbarStream {
    const emitter = new EventEmitter();
    setImmediate(() => {
        const samples: Array<TrendbarEvent> = [
            { symbol: EURUSD, open: 20, high: 80, low: 10, close: 70, period: 0, volume: 0, timestamp: 0 },
            { symbol: EURUSD, open: 21, high: 79, low: 21, close: 79, period: 0, volume: 0, timestamp: 0 },
            { symbol: EURUSD, open: 22, high: 78, low: 22, close: 78, period: 0, volume: 0, timestamp: 0 },
            { symbol: EURUSD, open: 77, high: 77, low: 23, close: 23, period: 0, volume: 0, timestamp: 0 },
            { symbol: EURUSD, open: 76, high: 76, low: 24, close: 24, period: 0, volume: 0, timestamp: 0 },
            { symbol: EURUSD, open: 75, high: 75, low: 25, close: 25, period: 0, volume: 0, timestamp: 0 },
        ]
        samples.forEach(bar => emitter.emit("trendbar", bar))
    })
    return emitter;
}

let ids = 0;
class O extends EventEmitter implements OrderStream {
    private readonly symbol: Symbol;
    public readonly id: string = `${ids++}`
    constructor(symbol: Symbol) {
        super();
        this.symbol = symbol;
        setImmediate(() => {
            const e: OrderAcceptedEvent = {
                symbol: this.symbol,
                timestamp: Date.now()
            }
            this.emit("accepted", e)
        })
    }
    amend() {
        return this;
    }
    cancel() {
        return this;
    }
    close() {
        setImmediate(() => {
            const e: OrderClosedEvent = {
                symbol: this.symbol,
                timestamp: Date.now()
            }
            this.emit("closed", e)
            this.end();
        })
        return this;
    }
    end() {
        setImmediate(() => {
            const e: OrderEndEvent = {
                symbol: this.symbol,
                timestamp: Date.now()
            }
            this.emit("end", e)
        })
        return this;
    }
}
class A extends EventEmitter implements AccountStream {
    order(symbol: Symbol): OrderStream {
        return new O(symbol);
    }
}

const account = new A();
const strategy = InsideBarMomentumStrategyStream.from(account);
strategy
    .on("bearish", console.log)
    .on("bullish", console.log)
