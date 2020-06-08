import mem from "mem";

import * as B from "../base";
import * as D from "../debug";
import * as G from "../generic";
import { marketOrderFromSpotPrices, stopOrderFromSpotPrices } from "./order";
import { includesCurrency } from "./util";

interface Order {
    symbol: Symbol;
    entry: B.Price;
    volume: B.Volume;
    tradeSide: B.TradeSide;
    profitLoss: B.Price;
}

interface LocalAccountProps extends B.AccountProps {
    spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
    initialBalance: B.Price;
}
class LocalAccountStream extends D.AccountStream {
    private readonly spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
    private readonly orders: Map<string, Order[]> = new Map();
    private balance: number = 0;

    constructor(props: LocalAccountProps) {
        super(props);
        const cacheKey = (arguments_: any) => JSON.stringify(arguments_.symbol);
        this.spots = mem(props.spots, { cacheKey })
    }

    push(event: B.AccountEvent | null): boolean {
        const tmp = super.push(event)
        if(event && event.type === "TRANSACTION") {
            const { timestamp, amount } = event;
            const oldBalance = this.balance
            const balance = Math.round((oldBalance + amount) * 100) / 100;
            this.push({timestamp, type: "BALANCE_CHANGED", balance})
        }
        if(event && event.type === "BALANCE_CHANGED") {
            this.balance = event.balance;
            this.updateEquity(event);
        }
        return tmp;
      }

    marketOrder(props: B.AccountSimpleMarketOrderProps): B.OrderStream<B.MarketOrderProps> {
        if (!includesCurrency(props.symbol, this.props.currency)) {
            const symbol = props.symbol.toString();
            const currency = this.props.currency.toString()
            throw new Error(
                `symbol ${symbol} does not involve currency ${currency}. This account only supports currency pairs with ${currency}.`
            );
        }

        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = this.spotPrices({ symbol: props.symbol })
        const stream = marketOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            this.push({...e, ...stream.props})
            if(e.type === "PROFITLOSS") {
                update(e);
            } else if(e.type === "ACCEPTED") {
                this.orders.get(props.id)!.push(order)
            } else if(e.type === "ENDED") {
                const all = this.orders.get(props.id)!
                const toBeDeleted: number[] = [];
                const amounts: B.Price[] = [];
                all.forEach((o, index) => {
                    if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                        amounts.push(o.profitLoss);
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
                amounts.forEach(amount => this.push({ type: "TRANSACTION", timestamp: e.timestamp, amount }));
            }
        })
        return stream;
    }

    stopOrder(props: B.AccountSimpleStopOrderProps): B.OrderStream<B.StopOrderProps> {
        if (!includesCurrency(props.symbol, this.props.currency)) {
            const symbol = props.symbol.toString();
            const currency = this.props.currency.toString()
            throw new Error(
                `symbol ${symbol} does not involve currency ${currency}. This account only supports currency pairs with ${currency}.`
            );
        }

        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = this.spotPrices({ symbol: props.symbol })
        const stream = stopOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            this.push({...e, ...stream.props})
            if(e.type === "PROFITLOSS") {
                update(e);
            } else if(e.type === "ACCEPTED") {
                this.orders.get(props.id)!.push(order)
            } else if(e.type === "ENDED") {
                const all = this.orders.get(props.id)!
                const toBeDeleted: number[] = [];
                const amounts: B.Price[] = [];
                all.forEach((o, index) => {
                    if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                        amounts.push(o.profitLoss);
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
                amounts.forEach(amount => this.push({ type: "TRANSACTION", timestamp: e.timestamp, amount }));
            }
        })
        return stream;
    }

    spotPrices(props: B.AccountSimpleSpotPricesProps): B.SpotPricesStream {
        return this.spots(props)
    }

    trendbars(props: B.AccountSimpleTrendbarsProps): B.TrendbarsStream {
        const { symbol } = props;
        const spots = this.spotPrices({ symbol });
        return G.toTrendbars({ ...props, spots })
    }

    private updateEquity(e: { timestamp: B.Timestamp }): void {
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((this.balance + profitLoss) * 100) / 100;
        this.push({ type: "EQUITY_CHANGED", timestamp: e.timestamp, equity });
    }
}

export function fromNothing(props: LocalAccountProps): B.AccountStream {
    const stream = new LocalAccountStream(props);
    stream.push({ type: "TRANSACTION", timestamp: 0, amount: props.initialBalance });
    return stream;
}