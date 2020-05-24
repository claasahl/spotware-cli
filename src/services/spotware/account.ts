import * as $ from "@claasahl/spotware-adapter";
import Lock from "async-lock"
import mem from "mem";

import * as B from "../base";
import { SpotwareClient } from "./client";
import { trendbarsFromSpotPrices } from "../local/trendbars"
import { marketOrder, stopOrder } from "./order";

interface Order {
    symbol: Symbol;
    entry: B.Price;
    volume: B.Volume;
    tradeSide: B.TradeSide;
    profitLoss: B.Price;
}

interface SpotwareAccountProps extends B.AccountProps {
    host: string,
    port: number
    clientId: string,
    clientSecret: string,
    accessToken: string
}
class SpotwareAccountStream extends B.DebugAccountStream {
    private readonly lock = new Lock();
    private readonly clientProps: Omit<SpotwareAccountProps, keyof B.AccountProps>;
    private readonly client: SpotwareClient;
    private ctidTraderAccountId?: number;
    private readonly subscribed: Set<B.Symbol> = new Set();
    private readonly symbols: Map<B.Symbol, $.ProtoOALightSymbol> = new Map();
    private readonly orders: Map<string, Order[]> = new Map();

    constructor({ currency, ...props }: SpotwareAccountProps) {
        super({ currency })
        this.clientProps = props;
        this.client = new SpotwareClient(props);
    }

    push(event: B.AccountEvent | null): boolean {
        const tmp = super.push(event)
        if(event && event.type === "BALANCE_CHANGED") {
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
            this.tryBalance({timestamp, balance})
            return ctidTraderAccountId;
        })
    }

    private async symbolId(symbol: B.Symbol): Promise<number> {
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

    private async symbol(symbol: B.Symbol): Promise<$.ProtoOASymbol> {
        const ctidTraderAccountId = await this.traderId();
        const symbolId = await this.symbolId(symbol);
        const data = await this.client.symbolById({ ctidTraderAccountId, symbolId: [symbolId] })
        return data.symbol[0];
    }

    async marketOrder(props: B.AccountSimpleMarketOrderProps): Promise<B.OrderStream<B.MarketOrderProps>> {
        const ctidTraderAccountId = await this.traderId();
        const symbolId = await this.symbolId(props.symbol);
        const details = await this.symbol(props.symbol);
        const {lotSize = 1, digits} = details;
        const client = this.client;

        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = await this.spotPrices(props);
        const stream = await marketOrder({...props, spots, client, ctidTraderAccountId, symbolId, lotSize, digits})
        const update = (e: B.OrderProfitLossEvent) => {
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
                        this.tryTransaction({ timestamp: e.timestamp, amount: o.profitLoss })
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
            }
            this.tryOrder({...e, ...stream.props})
        })
        return stream;
    }
    async stopOrder(props: B.AccountSimpleStopOrderProps): Promise<B.OrderStream<B.StopOrderProps>> {
        // TODO: equity
        const ctidTraderAccountId = await this.traderId();
        const symbolId = await this.symbolId(props.symbol);
        const details = await this.symbol(props.symbol);
        const {lotSize = 1, digits} = details;
        const client = this.client;

        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = await this.spotPrices(props);
        const stream = await stopOrder({...props, spots, client, ctidTraderAccountId, symbolId, lotSize, digits})
        const update = (e: B.OrderProfitLossEvent) => {
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
                        this.tryTransaction({ timestamp: e.timestamp, amount: o.profitLoss })
                        toBeDeleted.push(index);
                    }
                });
                toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
            }
            this.tryOrder({...e, ...stream.props})
        })
        return stream;
    }

    spotPrices = mem(this.sp0ts, { cacheKey: (arguments_: any) => JSON.stringify(arguments_.symbol) })

    private async sp0ts(props: B.AccountSimpleSpotPricesProps): Promise<B.SpotPricesStream> {
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
        const fact0r = Math.pow(10, PRECISION)

        const stream = new B.DebugSpotPricesStream(props);
        this.client.on("PROTO_OA_SPOT_EVENT", (msg: $.ProtoOASpotEvent) => {
            if (msg.symbolId !== symbolId) {
                return;
            }

            const timestamp = Date.now();
            if (msg.ask) {
                stream.tryAsk({ timestamp, ask: msg.ask / fact0r })
            }
            if (msg.bid) {
                stream.tryBid({ timestamp, bid: msg.bid / fact0r })
            }
            if (msg.ask && msg.bid) {
                stream.tryPrice({ timestamp, ask: msg.ask / fact0r, bid: msg.bid / fact0r })
            }
        })
        return stream;
    }

    async trendbars(props: B.AccountSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
        const spots = await this.spotPrices(props)
        return trendbarsFromSpotPrices({ ...props, spots })
    }

    private updateEquity(e: { timestamp: B.Timestamp }): void {
        const balance = this.balanceOrNull()?.balance || 0
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((balance + profitLoss) * 100) / 100;
        this.tryEquity({ timestamp: e.timestamp, equity });
    }
}

export function fromSomething(props: SpotwareAccountProps): B.AccountStream {
    return new SpotwareAccountStream(props);
}