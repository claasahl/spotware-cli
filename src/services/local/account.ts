import mem from "mem";
import * as B from "../base";
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
class LocalAccountStream extends B.DebugAccountStream {
    private readonly spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
    private readonly orders: Map<string, Order[]> = new Map();

    constructor(props: LocalAccountProps) {
        super(props);
        const cacheKey = (arguments_: any) => JSON.stringify(arguments_.symbol);
        this.spots = mem(props.spots, { cacheKey })
    }

    push(event: B.AccountEvent | null): boolean {
        const tmp = super.push(event)
        if(event && event.type === "BALANCE_CHANGED") {
            this.updateEquity(event);
        }
        return tmp;
      }

    async marketOrder(props: B.AccountSimpleMarketOrderProps): Promise<B.OrderStream<B.MarketOrderProps>> {
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
        const spots = await this.spotPrices({ symbol: props.symbol })
        const stream = await marketOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            this.tryOrder({...e, ...stream.props})
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
                amounts.forEach(amount => this.tryTransaction({ timestamp: e.timestamp, amount }));
            }
        })
        return stream;
    }

    async stopOrder(props: B.AccountSimpleStopOrderProps): Promise<B.OrderStream<B.StopOrderProps>> {
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
        const spots = await this.spotPrices({ symbol: props.symbol })
        const stream = await stopOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            this.tryOrder({...e, ...stream.props})
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
                amounts.forEach(amount => this.tryTransaction({ timestamp: e.timestamp, amount }));
            }
        })
        return stream;
    }

    spotPrices(props: B.AccountSimpleSpotPricesProps): Promise<B.SpotPricesStream> {
        return Promise.resolve(this.spots(props))
    }

    async trendbars(props: B.AccountSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
        const { symbol } = props;
        const spots = await this.spotPrices({ symbol });
        return B.toTrendbars({ ...props, spots })
    }

    private updateEquity(e: { timestamp: B.Timestamp }): void {
        const balance = this.balanceOrNull()?.balance || 0
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((balance + profitLoss) * 100) / 100;
        this.tryEquity({ timestamp: e.timestamp, equity });
    }
}

export function fromNothing(props: LocalAccountProps): B.AccountStream {
    const stream = new LocalAccountStream(props);
    stream.tryTransaction({ timestamp: 0, amount: props.initialBalance });
    return stream;
}