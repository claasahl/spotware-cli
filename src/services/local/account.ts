import * as B from "../base";
import { AccountProps } from "../base";
import { fromSpotPrices } from "./order";

interface LocalAccountProps extends AccountProps {
    spots: (props: B.SimpleSpotPricesProps) => B.SpotPricesStream;
    initialBalance: B.Price;
}
class LocalAccountStream extends B.DebugAccountStream {
    private readonly spots: (props: B.SimpleSpotPricesProps) => B.SpotPricesStream;
    private readonly orders: Map<string, B.Order[]> = new Map();
    private myBalance?: B.Price;
    
    constructor(props: LocalAccountProps) {
        super(props);
        this.spots = props.spots;
        this.on("balance", e => this.myBalance = e.balance)
    }

    order(props: B.SimpleOrderProps): B.OrderStream {
        if (!this.orders.has(props.id)) {
            this.orders.set(props.id, [])
        }
        const order: B.Order = { ...props, entry: 0, profitLoss: 0 }
        const spots = this.spotPrices({ symbol: props.symbol })
        const stream = fromSpotPrices({ ...props, spots })
        const update = (e: B.OrderProfitLossEvent) => {
            order.profitLoss = e.profitLoss;
            this.updateEquity(e)
        }
        stream.on("profitLoss", update)
        stream.once("end", e => {
            stream.off("profitLoss", update)
            const all = this.orders.get(props.id)!
            const toBeDeleted: number[] = [];
            all.forEach((o, index) => {
              if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
                this.emitTransaction({timestamp: e.timestamp, amount: o.profitLoss})
                toBeDeleted.push(index);
              }
            });
            toBeDeleted.reverse().forEach(i => all?.splice(i, 1));
      
            this.updateEquity(e)
        })
        stream.once("accepted", () => this.orders.get(props.id)!.push(order))
        return stream;
    }

    spotPrices(props: B.SimpleSpotPricesProps): B.SpotPricesStream {
        return this.spots(props)
    }

    private updateEquity(e: {timestamp: B.Timestamp}): void {
        const balance = this.myBalance || 0
        let profitLoss = 0;
        this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
        const equity = Math.round((balance + profitLoss) * 100) / 100;
        this.emitEquity({ timestamp: e.timestamp, equity });
    }
}

export function fromNothing(props: LocalAccountProps): B.AccountStream {
    const stream = new LocalAccountStream(props);
    stream.emitTransaction({timestamp: Date.now(), amount: props.initialBalance});
    return stream;
}