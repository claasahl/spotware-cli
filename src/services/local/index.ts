import {
  BalanceChangedEvent,
  EquityChangedEvent,
  DebugAccountStream,
  OrderEvent,
  AccountProps,
  SimpleOrderProps,
  SimpleSpotPricesProps
} from "../account";
import { SpotPricesStream, AskPriceChangedEvent, BidPriceChangedEvent } from "../spotPrices";
import { Price, Timestamp, Order } from "../types";
import { OrderStream, DebugOrderStream } from "../order";
import { includesCurrency } from "./util";

export interface LocalAccountProps extends AccountProps {
  balance: Price,
  spots: SpotPricesStream
}
export class LocalAccountStream extends DebugAccountStream {
  private balance: Price = 0;
  private spots: SpotPricesStream;
  private orders: Map<string, Order[]> = new Map();

  constructor(    props: LocalAccountProps  ) {
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
    setImmediate(() => {
      this.spots.on("ask", e => this.updateProfitLossForSellOrders(e));
      this.spots.on("bid", e => this.updateProfitLossForBuyOrders(e));
    });
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
    const stream = new DebugOrderStream(props);
    stream.on("end", e => {
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
    const spots = this.spotPrices({ symbol: props.symbol });
    if (props.tradeSide === "BUY") {
      spots.ask.then(ask => {
        order.entry = ask;
        this.orders.get(props.id)!.push(order)
        stream.emitFilled({ timestamp: Date.now(), entry: order.entry })

        spots.bid.then(bid => {
          order.profitLoss = (bid - order.entry) * order.volume;
          this.updateEquity(Date.now())
        })
      })
    } else if (props.tradeSide === "SELL") {
      spots.bid.then(bid => {
        order.entry = bid;
        this.orders.get(props.id)!.push(order)
        stream.emitFilled({ timestamp: Date.now(), entry: order.entry })

        spots.ask.then(ask => {
          order.profitLoss = (order.entry - ask) * order.volume;
          this.updateEquity(Date.now())
        })
      })
    }

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
    const e: BalanceChangedEvent = { balance: this.balance, timestamp };
    this.emitBalance(e);
  }
  private updateEquity(timestamp: Timestamp) {
    let profitLoss = 0;
    this.orders.forEach(o => o.forEach(o => (profitLoss += o.profitLoss)));
    const equity = Math.round((this.balance + profitLoss) * 100) / 100;
    const e: EquityChangedEvent = { equity, timestamp };
    this.emitEquity(e);
  }

  private updateProfitLossForSellOrders(e: AskPriceChangedEvent) {
    this.orders.forEach(o => o.forEach(order => {
      if (order.tradeSide === "SELL") {
        order.profitLoss = (order.entry - e.ask) * order.volume;
      }
    }))
    this.updateEquity(e.timestamp)
  }
  private updateProfitLossForBuyOrders(e: BidPriceChangedEvent) {
    this.orders.forEach(o => o.forEach(order => {
      if (order.tradeSide === "BUY") {
        order.profitLoss = (e.bid - order.entry) * order.volume;
      }
    }))
    this.updateEquity(e.timestamp)
  }
}
