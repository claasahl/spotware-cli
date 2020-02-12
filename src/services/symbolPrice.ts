import { EventEmitter } from "events";
import { bearish, bullish, range } from "indicators";

const EURUSD = Symbol.for("EURUSD")

type Price = number;
type Volume = number;
type Period = number;
type Timestamp = number;
type Symbol = symbol;
type TradeSide = "BUY" | "SELL"

// API should be async, stream of events
// an Order has a lifecyle which can be represented through events (e.g. a "mini stream")
// a Symbol (e.g. "EURUSD") experiences price changes, which can be represented through events

export namespace SpotPriceStream {
    export interface AskPriceChangedEvent {
        symbol: Symbol,
        price: Price,
        timestamp: Timestamp
    }
    export interface BidPriceChangedEvent {
        symbol: Symbol,
        price: Price,
        timestamp: Timestamp
    }
    export interface PriceChangedEvent {
        symbol: Symbol,
        ask: Price,
        bid: Price,
        timestamp: Timestamp
    }
    export interface SpotPriceStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
        addListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
        addListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
        on(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
        on(event: "price", listener: (e: PriceChangedEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
        once(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
        once(event: "price", listener: (e: PriceChangedEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
        prependListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
        prependListener(event: "price", listener: (e: PriceChangedEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "ask", listener: (e: AskPriceChangedEvent) => void): this;
        prependOnceListener(event: "bid", listener: (e: BidPriceChangedEvent) => void): this;
        prependOnceListener(event: "price", listener: (e: PriceChangedEvent) => void): this;
    }

    export function from(_stream: AccountStream.AccountStream, _symbol: Symbol): SpotPriceStream {
        return new EventEmitter();
    }
}
export namespace TrendbarStream {
    export interface TrendbarEvent {
        symbol: Symbol,
        open: Price,
        high: Price,
        low: Price,
        close: Price,
        volume: Volume,
        period: Period
        timestamp: Timestamp
    }

    export interface TrendbarStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "trendbar", listener: (e: TrendbarEvent) => void): this;
    }

    export function from(_stream: AccountStream.AccountStream, _symbol: Symbol): TrendbarStream;
    export function from(_stream: SpotPriceStream.SpotPriceStream): TrendbarStream;
    export function from(_stream: AccountStream.AccountStream | SpotPriceStream.SpotPriceStream, _symbol?: Symbol): TrendbarStream {
        const emitter = new EventEmitter();
        setImmediate(() => {
            const samples: Array<TrendbarStream.TrendbarEvent> = [
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
}

export namespace OrderStream {
    export interface OrderAcceptedEvent {
        symbol: Symbol,
        timestamp: Timestamp
    }
    export interface OrderFilledEvent {
        symbol: Symbol,
        timestamp: Timestamp
    }
    export interface OrderClosedEvent {
        symbol: Symbol,
        timestamp: Timestamp
    }
    export interface OrderEndEvent {
        symbol: Symbol,
        timestamp: Timestamp
    }
    export interface OrderStream extends EventEmitter {
        readonly id: string;

        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        addListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        addListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
        addListener(event: "end", listener: (e: OrderEndEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        on(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        on(event: "closed", listener: (e: OrderClosedEvent) => void): this;
        on(event: "end", listener: (e: OrderEndEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        once(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        once(event: "closed", listener: (e: OrderClosedEvent) => void): this;
        once(event: "end", listener: (e: OrderEndEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        prependListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        prependListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
        prependListener(event: "end", listener: (e: OrderEndEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        prependOnceListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        prependOnceListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
        prependOnceListener(event: "end", listener: (e: OrderEndEvent) => void): this;

        close(): this;
        cancel(): this;
        end(): this;
        amend(): this;
    }
}

export namespace AccountStream {
    export interface BalanceChangedEvent {
        balance: Price
        timestamp: Timestamp
    }
    export interface EquityChangedEvent {
        equity: Price
        timestamp: Timestamp
    }
    export interface OrderEvent {
        timestamp: Timestamp
    }
    export interface AccountStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        addListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
        addListener(event: "order", listener: (e: OrderEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        on(event: "equity", listener: (e: EquityChangedEvent) => void): this;
        on(event: "order", listener: (e: OrderEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        once(event: "equity", listener: (e: EquityChangedEvent) => void): this;
        once(event: "order", listener: (e: OrderEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        prependListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
        prependListener(event: "order", listener: (e: OrderEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        prependOnceListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
        prependOnceListener(event: "order", listener: (e: OrderEvent) => void): this;

        order(symbol: Symbol): OrderStream.OrderStream;
    }

}

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

    function engulfed(barPrev: TrendbarStream.TrendbarEvent, barCurr: TrendbarStream.TrendbarEvent): boolean {
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

    export function from(account: AccountStream.AccountStream, options: Partial<Options> = {}): InsideBarMomentumStrategyStream {
        const stream = TrendbarStream.from(account);
        const emitter = new EventEmitter();
        const { enterOffset, stopLossOffset, takeProfitOffset } = Object.assign(options, DEFAULT_OPTIONS)
        let prevBar: TrendbarStream.TrendbarEvent | null = null
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

        const orders: Map<string, OrderStream.OrderStream> = new Map();
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

let ids = 0;
class O extends EventEmitter implements OrderStream.OrderStream {
    private readonly symbol: Symbol;
    public readonly id: string = `${ids++}`
    constructor(symbol: Symbol) {
        super();
        this.symbol = symbol;
        setImmediate(() => {
            const e: OrderStream.OrderAcceptedEvent = {
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
            const e: OrderStream.OrderClosedEvent = {
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
            const e: OrderStream.OrderEndEvent = {
                symbol: this.symbol,
                timestamp: Date.now()
            }
            this.emit("end", e)
        })
        return this;
    }
}
class A extends EventEmitter implements AccountStream.AccountStream {
    order(symbol: Symbol): OrderStream.OrderStream {
        return new O(symbol);
    }
}

const account = new A();
const strategy = InsideBarMomentumStrategyStream.from(account);
strategy
    .on("bearish", console.log)
    .on("bullish", console.log)
