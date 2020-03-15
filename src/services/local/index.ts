import {
  BalanceChangedEvent,
  EquityChangedEvent,
  DebugAccountStream,
  OrderEvent,
  AccountProps,
  SimpleOrderProps,
  SimpleSpotPricesProps,
  SpotPricesStream,
  Price, Timestamp, Order,
  OrderStream, OrderProfitLossEvent
} from "../base";
import { includesCurrency } from "./util";
import { fromSpotPrices } from "./order";

export interface LocalAccountProps extends AccountProps {
  balance: Price,
  spots: SpotPricesStream
}
export class LocalAccountStream extends DebugAccountStream {
  private balance: Price = 0;
  private spots: SpotPricesStream;
  private orders: Map<string, Order[]> = new Map();

  constructor(props: LocalAccountProps) {
    super(props);
    if (!includesCurrency(props.spots.symbol, props.currency)) {
      throw new Error(
        `symbol ${props.spots.symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }
    this.balance = props.balance;
    this.spots = props.spots;
    this.updateBalance(Date.now());
    this.updateEquity(Date.now());
  }
  order(props: SimpleOrderProps): OrderStream {
    // refactor!
    if (!includesCurrency(props.symbol, this.currency)) {
      throw new Error(
        `symbol ${props.symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }

    if (!this.orders.has(props.id)) {
      this.orders.set(props.id, [])
    }
    const order: Order = { ...props, entry: 0, profitLoss: 0 }
    const spots = this.spotPrices({ symbol: props.symbol });
    const stream = fromSpotPrices({ ...props, spots })
    stream.on("end", e => {
      stream.off("profitLoss", update)
      const all = this.orders.get(props.id)!
      const toBeDeleted: number[] = [];
      all.forEach((o, index) => {
        if (order.tradeSide === o.tradeSide && order.volume >= o.volume) {
          this.balance += o.profitLoss;
          toBeDeleted.push(index);
        }
      });
      toBeDeleted.reverse().forEach(i => all?.splice(i, 1));

      this.updateBalance(e.timestamp);
      this.updateEquity(e.timestamp)
    });
    stream.once("filled", () => this.orders.get(props.id)!.push(order))
    const update = (e: OrderProfitLossEvent) => {
      order.profitLoss = e.profitLoss;
      this.updateEquity(e.timestamp)
    }
    stream.on("profitLoss", update)

    const e: OrderEvent = { timestamp: Date.now() };
    this.emitOrder(e);
    return stream;
  }
  spotPrices(props: SimpleSpotPricesProps): SpotPricesStream {
    if (props.symbol !== this.spots.symbol) {
      throw new Error(
        `spot prices for symbol ${props.symbol.toString()} cannot be provided. This account can only supply spot prices for ${this.spots.symbol.toString()}.`
      );
    }
    return this.spots;
  }

  private updateBalance(timestamp: Timestamp) {
    const e: BalanceChangedEvent = { timestamp, balance: this.balance };
    this.emitBalance(e);
  }
  private updateEquity(timestamp: Timestamp) {
    let profitLoss = 0;
    this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
    const equity = Math.round((this.balance + profitLoss) * 100) / 100;
    const e: EquityChangedEvent = { timestamp, equity };
    this.emitEquity(e);
  }
}
