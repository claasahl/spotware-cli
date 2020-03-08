import {
  BalanceChangedEvent,
  EquityChangedEvent,
  DebugAccountStream,
  OrderEvent,
  AccountProps,
  SimpleOrderProps,
  SimpleSpotPricesProps
} from "../account";
import { SpotPricesStream } from "../spotPrices";
import { Price, Timestamp, Order } from "../types";
import { OrderStream, DebugOrderStream } from "../order";
import { spotPrices, sampleData } from "./data";
import { includesCurrency } from "./util";

class LocalAccountStream extends DebugAccountStream {
  private balance: Price = 0;
  private spots: SpotPricesStream;
  private ask: Price | null = null;
  private bid: Price | null = null;
  private orders: Order[];

  constructor(
    props: AccountProps,
    initialBalance: Price,
    spots: SpotPricesStream
  ) {
    super(props);
    if (!includesCurrency(spots.symbol, props.currency)) {
      throw new Error(
        `symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }
    this.balance = initialBalance;
    this.spots = spots;
    this.orders=[{entry: 6611.79, symbol: Symbol.for(""), tradeSide: "BUY", profitLoss: 0, volume: 1}]
    this.updateBalance(Date.now());
    setImmediate(() => {
      this.spots.on("ask", e => {
        this.orders.forEach(order => {
          if(order.tradeSide === "SELL") {
            order.profitLoss = (order.entry - e.ask) * order.volume;
          }
        })
        this.updateEquity(e.timestamp)
      });
      this.spots.on("bid", e => {
        this.orders.forEach(order => {
          if(order.tradeSide === "BUY") {
            order.profitLoss = (e.bid - order.entry) * order.volume;
          }
        })
        this.updateEquity(e.timestamp)
      });
    });
  }
  order(props: SimpleOrderProps): OrderStream {
    if (!includesCurrency(symbol, this.currency)) {
      throw new Error(
        `symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }

    const order: Order = {...props, entry: 0, profitLoss: 0}
    const stream = new DebugOrderStream(props);
    stream.on("end", () => {
      // update balance (and equity)
    });
    const prices = this.spotPrices({ symbol: props.symbol });
    if (props.tradeSide === "BUY") {
      if(this.ask) {
        order.entry = this.ask;
        this.orders.push(order)
        stream.emitFilled({timestamp: Date.now()})
      } else {
        prices.once("ask", e=> {
          this.ask = e.ask;
          order.entry = this.ask;
          this.orders.push(order)
          stream.emitFilled({timestamp: e.timestamp})
        })
      }
    } else if (props.tradeSide === "SELL") {
      if(this.bid) {
        order.entry = this.bid;
        this.orders.push(order)
        stream.emitFilled({timestamp: Date.now()})
      } else {
        prices.once("bid", e=> {
          this.bid = e.bid;
          order.entry = this.bid;
          this.orders.push(order)
          stream.emitFilled({timestamp: e.timestamp})
        })
      }
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
  this.orders.forEach(o => (profitLoss += o.profitLoss));
  const equity = Math.round((this.balance! + profitLoss) * 100) / 100;
    const e: EquityChangedEvent = { equity, timestamp };
    this.emitEquity(e);
  }
}

const name = "BTC/EUR";
const symbol = Symbol.for(name);
const currency = Symbol.for("EUR");
const spots = spotPrices(symbol, sampleData());
const account = new LocalAccountStream({ currency }, 1000, spots);
setImmediate(() => {
  account.spotPrices({ symbol });
});
setImmediate(() => {
  account.order({ id: "1", symbol, tradeSide: "BUY", volume: 1 });
});
