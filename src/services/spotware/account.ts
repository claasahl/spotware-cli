import * as $ from "@claasahl/spotware-adapter";
import Lock from "async-lock"

import * as B from "../base";
import { SpotwareClient } from "./client";
import { trendbarsFromSpotPrices } from "../local/trendbars"

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

    constructor({ currency, ...props }: SpotwareAccountProps) {
        super({ currency })
        this.clientProps = props;
        this.client = new SpotwareClient(props);
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
        const tradeSide = (() => {
            switch (props.tradeSide) {
                case "SELL":
                    return $.ProtoOATradeSide.SELL
                case "BUY":
                default:
                    return $.ProtoOATradeSide.BUY
            }
        })();
        const event = await this.client.newOrder({
            ctidTraderAccountId,
            orderType: $.ProtoOAOrderType.MARKET,
            symbolId,
            tradeSide,
            volume: props.volume * (details.lotSize || 1),
            takeProfit: props.takeProfit,
            stopLoss: props.stopLoss
        })
        const spots = await this.spotPrices(props);
        const stream = new B.DebugOrderStream({ ...props, orderType: "MARKET" });
        stream.emitCreated({timestamp: Date.now()})
        const round = (price: number) => {
            const factor = Math.pow(10, details.digits);
            return Math.round(price * factor) / factor
        }
        this.client.on("PROTO_OA_EXECUTION_EVENT", (msg: $.ProtoOAExecutionEvent) => {
            if (!msg.deal || !event.position || msg.deal.positionId !== event.position.positionId) {
                return
            }
            const timestamp = Date.now();
            switch (msg.executionType) {
                case $.ProtoOAExecutionType.ORDER_ACCEPTED:
                    stream.emitAccepted({ timestamp });
                    break;
                case $.ProtoOAExecutionType.ORDER_EXPIRED:
                case $.ProtoOAExecutionType.ORDER_CANCELLED:
                    stream.emitCanceled({ timestamp });
                    break;
                case $.ProtoOAExecutionType.ORDER_FILLED:
                    const executionPrice = msg.deal.executionPrice || 0;
                    if(msg.deal.closePositionDetail) {
                        const profitLoss = msg.deal.closePositionDetail.grossProfit / Math.pow(10, details.digits);
                        const balance = msg.deal.closePositionDetail.balance / Math.pow(10, details.digits);
                        stream.emitClosed({ timestamp, exit: executionPrice, profitLoss });
                        stream.emitEnded({ timestamp, exit: executionPrice, profitLoss });
                        this.emitTransaction({timestamp, amount: profitLoss})
                        this.emitBalance({timestamp, balance})
                        break;
                    }

                    stream.emitFilled({ timestamp, entry: executionPrice });
                    if(props.tradeSide === "BUY") {
                        const update = (e: B.BidPriceChangedEvent) => {
                            const {timestamp, bid: price} = e
                            const profitLoss = round((price - executionPrice) * stream.props.volume);
                            stream.emitProfitLoss({ timestamp, price, profitLoss })
                        }
                        spots.on("bid", update);
                        stream.once("ended", () => spots.off("bid", update))
                    } else if(props.tradeSide === "SELL") {
                        const update = (e: B.AskPriceChangedEvent) => {
                            const {timestamp, ask: price} = e
                            const profitLoss = round((executionPrice - price) * stream.props.volume);
                            stream.emitProfitLoss({ timestamp, price, profitLoss })
                        }
                        spots.on("ask", update);
                        stream.once("ended", () => spots.off("ask", update))
                    }
                    break;
                case $.ProtoOAExecutionType.ORDER_REJECTED:
                    stream.emitRejected({ timestamp });
                    break;
                default:
                    const error = new Error(`unexpected event: ${JSON.stringify(msg)}`)
                    console.log(error)
                    setImmediate(() => this.emit("error", error))
            }
        })
        return stream;
    }
    async stopOrder(_props: B.AccountSimpleStopOrderProps): Promise<B.OrderStream<B.StopOrderProps>> {
        throw new Error("not implemented");
    }

    async spotPrices(props: B.AccountSimpleSpotPricesProps): Promise<B.SpotPricesStream> {
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
                stream.emitAsk({ timestamp, ask: msg.ask / fact0r })
            }
            if (msg.bid) {
                stream.emitBid({ timestamp, bid: msg.bid / fact0r })
            }
            if (msg.ask && msg.bid) {
                stream.emitPrice({ timestamp, ask: msg.ask / fact0r, bid: msg.bid / fact0r })
            }
        })
        return stream;
    }

    async trendbars(props: B.AccountSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
        const spots = await this.spotPrices(props)
        return trendbarsFromSpotPrices({ ...props, spots })
    }
}

export function fromSomething(props: SpotwareAccountProps): B.AccountStream {
    return new SpotwareAccountStream(props);
}