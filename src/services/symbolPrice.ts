import { EventEmitter } from "events";

type Price = number;
type Volume = number;
type Period = "M1" | "M5" | "M10" | "M15"
type Timestamp = number;
type Symbol = symbol;

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
        return new EventEmitter();
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
    export interface OrderStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        addListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        addListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        on(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        on(event: "closed", listener: (e: OrderClosedEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        once(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        once(event: "closed", listener: (e: OrderClosedEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        prependListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        prependListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "accepted", listener: (e: OrderAcceptedEvent) => void): this;
        prependOnceListener(event: "filled", listener: (e: OrderFilledEvent) => void): this;
        prependOnceListener(event: "closed", listener: (e: OrderClosedEvent) => void): this;
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
    export interface AccountStream extends EventEmitter {
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        addListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        on(event: "equity", listener: (e: EquityChangedEvent) => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        once(event: "equity", listener: (e: EquityChangedEvent) => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        prependListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "balance", listener: (e: BalanceChangedEvent) => void): this;
        prependOnceListener(event: "equity", listener: (e: EquityChangedEvent) => void): this;
    }

}
const a: SpotPriceStream.SpotPriceStream = new EventEmitter();
const b = TrendbarStream.from(a)
b.on("trendbar", _bar => {})