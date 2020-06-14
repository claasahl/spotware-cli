import * as $ from "@claasahl/spotware-adapter";
import Lock from "async-lock"
import { Readable } from "stream";

import * as T from "../types";
import * as D from "../debug";
import * as G from "../generic";
import * as L from "../logging";
import { SpotwareClient } from "./client";
import { marketOrder, stopOrder } from "./order";

interface Order {
    symbol: Symbol;
    entry: T.Price;
    volume: T.Volume;
    tradeSide: T.TradeSide;
    profitLoss: T.Price;
}

interface SpotwareAccountProps extends T.AccountProps {
    host: string,
    port: number
    clientId: string,
    clientSecret: string,
    accessToken: string
}
class SpotwareAccountStream extends D.AccountStream {
    private readonly lock = new Lock();
    private readonly clientProps: Omit<SpotwareAccountProps, keyof T.AccountProps>;
    private readonly client: SpotwareClient;
    private ctidTraderAccountId?: number;
    private balance: number = 0;
    private readonly subscribed: Set<T.Symbol> = new Set();
    private readonly symbols: Map<T.Symbol, $.ProtoOALightSymbol> = new Map();
    private readonly orders: Map<string, Order[]> = new Map();

    constructor({ currency, ...props }: SpotwareAccountProps) {
        super({ currency })
        this.clientProps = props;
        this.client = new SpotwareClient(props);
    }

    push(event: T.AccountEvent | null): boolean {
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

    private async traderId(): Promise<number> {
        return this.lock.acquire("traderId", async () => {
            if (this.ctidTraderAccountId) {
                return this.ctidTraderAccountId;
            }
            const { clientId, clientSecret, accessToken } = this.clientProps
            await this.client.applicationAuth({ clientId, clientSecret })
            const accounts = await this.client.getAccountListByAccessToken({ accessToken })
            if (accounts.ctidTraderAccount.length !== 1) {
                throw new Error(`can only handle exactly one account. supplied accessToken has access to ${accounts.ctidTraderAccount.length} accounts`)
            }
            const { ctidTraderAccountId } = accounts.ctidTraderAccount[0]
            await this.client.accountAuth({ ctidTraderAccountId, accessToken })
            this.ctidTraderAccountId = ctidTraderAccountId;
            const trader = await this.client.trader({ctidTraderAccountId})
            const timestamp = Date.now();
            const balance = trader.trader.balance / 100;
            this.push({ type: "BALANCE_CHANGED", timestamp, balance})
            return ctidTraderAccountId;
        })
    }

    private async symbolId(symbol: T.Symbol): Promise<number> {
        const details = this.symbols.get(symbol);
        if (details) {
            return details.symbolId;
        }
        return this.lock.acquire("symbols", async () => {
            const ctidTraderAccountId = await this.traderId();
            const symbols = await this.client.symbolsList({ ctidTraderAccountId })
            this.symbols.clear();
            symbols.symbol.forEach(s => this.symbols.set(Symbol.for(s.symbolName || ""), s))
            const details = this.symbols.get(symbol);
            if (details) {
                return details.symbolId;
            }
            throw new Error(`could not find ${symbol.toString()}`)
        })
    }

    private async symbol(symbol: T.Symbol): Promise<$.ProtoOASymbol> {
        const ctidTraderAccountId = await this.traderId();
        const symbolId = await this.symbolId(symbol);
        const data = await this.client.symbolById({ ctidTraderAccountId, symbolId: [symbolId] })
        return data.symbol[0];
    }

    marketOrder(props: T.AccountSimpleMarketOrderProps): T.OrderStream<T.MarketOrderProps> {
        const client = this.client;

        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = this.spotPrices(props);
        const stream = marketOrder({
            ...props,
            spots,
            client,
            ctidTraderAccountId: () => this.traderId(),
            spotwareSymbol: () => this.symbol(props.symbol)
        })
        const update = (e: T.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            if(e.type === "PROFITLOSS") {
                update(e);
            } else if(e.type === "ACCEPTED") {
                this.orders.get(props.id)!.push(order)
            } else if(e.type === "ENDED") {
                const all = this.orders.get(props.id)!
                const toBeDeleted: number[] = [];
                all.forEach((o, index) => {
                    if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                        this.push({ type: "TRANSACTION", timestamp: e.timestamp, amount: o.profitLoss })
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
            }
            this.push({...e, ...stream.props})
        })
        return stream;
    }
    stopOrder(props: T.AccountSimpleStopOrderProps): T.OrderStream<T.StopOrderProps> {
        const client = this.client;
        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = this.spotPrices(props);
        const stream = stopOrder({
            ...props,
            spots,
            client,
            ctidTraderAccountId: () => this.traderId(),
            spotwareSymbol: () => this.symbol(props.symbol)
        })
        const update = (e: T.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("data", e => {
            if(e.type === "PROFITLOSS") {
                update(e);
            } else if(e.type === "ACCEPTED") {
                this.orders.get(props.id)!.push(order)
            } else if(e.type === "ENDED") {
                const all = this.orders.get(props.id)!
                const toBeDeleted: number[] = [];
                all.forEach((o, index) => {
                    if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                        this.push({ type: "TRANSACTION", timestamp: e.timestamp, amount: o.profitLoss })
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
            }
            this.push({...e, ...stream.props})
        })
        return stream;
    }

    spotPrices(props: T.AccountSimpleSpotPricesProps): T.SpotPricesStream {
        class Stream extends Readable implements T.SpotPricesStream {
            readonly props: T.SpotPricesProps;
            constructor(props: T.SpotPricesProps) {
                super({objectMode:true, read: () => {}})
                this.props = Object.freeze(props);
                L.logSpotPriceEvents(this);
            }
            push(chunk: T.SpotPricesEvent, encoding?: BufferEncoding): boolean {
                return super.push(chunk, encoding);
            }
            trendbars(_props: Pick<T.TrendbarsProps, "period">): T.TrendbarsStream {
                throw new Error("Method not implemented.");
            }
        }
        const stream = new Stream(props);
        setImmediate(async () => {
            try {
                const ctidTraderAccountId = await this.traderId();
                const symbolId = await this.symbolId(props.symbol);
                await this.lock.acquire("subscription", async () => {
                    if (this.subscribed.has(props.symbol)) {
                        return;
                    }
                    await this.client.subscribeSpots({ ctidTraderAccountId, symbolId: [symbolId] })
                    this.subscribed.add(props.symbol);
                })

                const PRECISION = 5;
                const fact0r = Math.pow(10, PRECISION);
                this.client.on("PROTO_OA_SPOT_EVENT", (msg: $.ProtoOASpotEvent) => {
                    if (msg.symbolId !== symbolId) {
                        return;
                    }

                    const timestamp = Date.now();
                    if (msg.ask) {
                        stream.push({ type: "ASK_PRICE_CHANGED", timestamp, ask: msg.ask / fact0r })
                    }
                    if (msg.bid) {
                        stream.push({ type: "BID_PRICE_CHANGED", timestamp, bid: msg.bid / fact0r })
                    }
                    if (msg.ask && msg.bid) {
                        stream.push({ type: "PRICE_CHANGED", timestamp, ask: msg.ask / fact0r, bid: msg.bid / fact0r })
                    }
                })
                this.client.on("error", err => stream.destroy(err))
            } catch (error) {
                stream.destroy(error)
            }
        })
        return stream;
    }

    trendbars(props: T.AccountSimpleTrendbarsProps): T.TrendbarsStream {
        const spots = this.spotPrices(props)
        return G.toTrendbars({ ...props, spots })
    }

    private updateEquity(e: { timestamp: T.Timestamp }): void {
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((this.balance + profitLoss) * 100) / 100;
        this.push({ type: "EQUITY_CHANGED", timestamp: e.timestamp, equity });
    }
}

export function fromSomething(props: SpotwareAccountProps): T.AccountStream {
    return new SpotwareAccountStream(props);
}