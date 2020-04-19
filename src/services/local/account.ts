import mem from "mem";
import * as B from "../base";
import { marketOrderFromSpotPrices, stopOrderFromSpotPrices } from "./order";
import { includesCurrency } from "./util";
import { trendbarsFromSpotPrices } from "./trendbars";

interface LocalAccountProps extends B.AccountProps {
    spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
    initialBalance: B.Price;
}
class LocalAccountStream extends B.DebugAccountStream {
    private readonly spots: (props: B.AccountSimpleSpotPricesProps) => B.SpotPricesStream;
    private readonly orders: Map<string, B.Order[]> = new Map();
    private myBalance?: B.Price;

    constructor(props: LocalAccountProps) {
        super(props);
        const cacheKey = (arguments_: any) => JSON.stringify(arguments_.symbol);
        this.spots = mem(props.spots, {cacheKey})
        this.on("balance", e => this.myBalance = e.balance)
        this.on("balance", this.updateEquity)
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
        const order: B.Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = await this.spotPrices({ symbol: props.symbol })
        const stream = await marketOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("profitLoss", update)
        stream.once("ended", e => {
            stream.off("profitLoss", update)
            const all = this.orders.get(props.id)!
            const toBeDeleted: number[] = [];
            all.forEach((o, index) => {
                if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                    this.emitTransaction({ timestamp: e.timestamp, amount: o.profitLoss })
                    toBeDeleted.push(index);
                }
            });
            toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
        })
        stream.once("accepted", () => this.orders.get(props.id)!.push(order))
        stream.once("accepted", e => this.emitOrder({ timestamp: e.timestamp, status: "ACCEPTED", ...stream.props }))
        stream.once("rejected", e => this.emitOrder({ timestamp: e.timestamp, status: "REJECTED", ...stream.props }))
        stream.once("canceled", e => this.emitOrder({ timestamp: e.timestamp, status: "CANCELED", ...stream.props }))
        stream.once("filled", e => this.emitOrder({ timestamp: e.timestamp, status: "FILLED", ...stream.props }))
        stream.once("closed", e => this.emitOrder({ timestamp: e.timestamp, status: "CLOSED", ...stream.props }))
        stream.once("ended", e => this.emitOrder({ timestamp: e.timestamp, status: "ENDED", ...stream.props }))
        this.emitOrder({ timestamp: Date.now(), status: "CREATED", ...stream.props })
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
        const order: B.Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = await this.spotPrices({ symbol: props.symbol })
        const stream = await stopOrderFromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("profitLoss", update)
        stream.once("ended", e => {
            stream.off("profitLoss", update)
            const all = this.orders.get(props.id)!
            const toBeDeleted: number[] = [];
            all.forEach((o, index) => {
                if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                    this.emitTransaction({ timestamp: e.timestamp, amount: o.profitLoss })
                    toBeDeleted.push(index);
                }
            });
            toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
        })
        stream.once("accepted", () => this.orders.get(props.id)!.push(order))
        stream.once("accepted", e => this.emitOrder({ timestamp: e.timestamp, status: "ACCEPTED", ...stream.props }))
        stream.once("rejected", e => this.emitOrder({ timestamp: e.timestamp, status: "REJECTED", ...stream.props }))
        stream.once("canceled", e => this.emitOrder({ timestamp: e.timestamp, status: "CANCELED", ...stream.props }))
        stream.once("filled", e => this.emitOrder({ timestamp: e.timestamp, status: "FILLED", ...stream.props }))
        stream.once("closed", e => this.emitOrder({ timestamp: e.timestamp, status: "CLOSED", ...stream.props }))
        stream.once("ended", e => this.emitOrder({ timestamp: e.timestamp, status: "ENDED", ...stream.props }))
        this.emitOrder({ timestamp: Date.now(), status: "CREATED", ...stream.props })
        return stream;
    }

    spotPrices(props: B.AccountSimpleSpotPricesProps): Promise<B.SpotPricesStream> {
        return Promise.resolve(this.spots(props))
    }

    async trendbars(props: B.AccountSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
        const { symbol } = props;
        const spots = await this.spotPrices({ symbol });
        return trendbarsFromSpotPrices({...props, spots})
    }

    private updateEquity(e: { timestamp: B.Timestamp }): void {
        const balance = this.myBalance || 0
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((balance + profitLoss) * 100) / 100;
        this.emitEquity({ timestamp: e.timestamp, equity });
    }
}

export function fromNothing(props: LocalAccountProps): B.AccountStream {
    const stream = new LocalAccountStream(props);
    stream.emitTransaction({ timestamp: Date.now(), amount: props.initialBalance });
    return stream;
}