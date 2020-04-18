import * as $ from "@claasahl/spotware-adapter";
import Lock from "async-lock"

import * as B from "../base";
import { SpotwareClient } from "./client";
import {trendbarsFromSpotPrices} from "../local/trendbars"

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
    private subscribed: Set<B.Symbol> = new Set();

    constructor({currency, ...props}: SpotwareAccountProps) {
        super({currency})
        this.clientProps = props;
        this.client = new SpotwareClient(props);
    }

    private async traderId(): Promise<number> {
        return this.lock.acquire("traderId", async () => {
            if(this.ctidTraderAccountId) {
                return this.ctidTraderAccountId;
            }
            const { clientId, clientSecret, accessToken } = this.clientProps
            await this.client.applicationAuth({clientId, clientSecret})
            const accounts = await this.client.getAccountListByAccessToken({accessToken})
            if(accounts.ctidTraderAccount.length !== 1) {
                throw new Error(`can only handle exactly one account. supplied accessToken has access to ${accounts.ctidTraderAccount.length} accounts`)
            }
            const { ctidTraderAccountId } = accounts.ctidTraderAccount[0]
            await this.client.accountAuth({ctidTraderAccountId, accessToken})
            this.ctidTraderAccountId = ctidTraderAccountId;
            return ctidTraderAccountId;
        })
    }

    async spotPrices(props: B.AccountSimpleSpotPricesProps): Promise<B.SpotPricesStream> {
        const ctidTraderAccountId = await this.traderId();
        const symbols = await this.client.symbolsList({ctidTraderAccountId})
        const [symbol, ...rest] = symbols.symbol.filter(s => props.symbol.toString() === `Symbol(${s.symbolName})`)
        if(!symbol) {
            throw new Error(`could not find ${props.symbol.toString()}`)
        }
        if(rest.length !== 0) {
            throw new Error(`found multiple symbols matching ${props.symbol.toString()}`)
        }
        await this.lock.acquire("subscription", async () => {
            if(this.subscribed.has(props.symbol)) {
                return;
            }
            await this.client.subscribeSpots({ctidTraderAccountId, symbolId: [symbol.symbolId]})
            this.subscribed.add(props.symbol);
        })
        
        const PRECISION = 5;
        const fact0r = Math.pow(10, PRECISION)

        const stream = new B.DebugSpotPricesStream(props);
        this.client.on("PROTO_OA_SPOT_EVENT", (msg: $.ProtoOASpotEvent) => {
            if(msg.symbolId !== symbol.symbolId) {
                return;
            }

            const timestamp = Date.now();
            if(msg.ask) {
                stream.emitAsk({timestamp, ask: msg.ask / fact0r})
            }
            if(msg.bid) {
                stream.emitBid({timestamp, bid: msg.bid / fact0r})
            }
            if(msg.ask && msg.bid) {
                stream.emitPrice({timestamp, ask: msg.ask / fact0r, bid: msg.bid / fact0r})
            }
        })
        return stream;
    }

    async trendbars(props: B.AccountSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
        const spots = await this.spotPrices(props)
        return trendbarsFromSpotPrices({...props, spots})
    }
}

export function fromSomething(props: SpotwareAccountProps): B.AccountStream {
    return new SpotwareAccountStream(props);
}