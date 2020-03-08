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
import { Price, Timestamp } from "../types";
import { OrderStream, DebugOrderStream } from "../order";
import { fromFile, spotPrices } from "./data";
import { includesCurrency } from "./util";

class LocalAccountStream extends DebugAccountStream {
  private balance: Price = 0;
  private equity: Price = 0;
  private spots: SpotPricesStream;

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
    this.equity = initialBalance;
    this.spots = spots;
    this.updateBalance(Date.now());
    setImmediate(() => {
      this.spots.on("ask", e => this.updateEquity(e.timestamp));
      this.spots.on("bid", e => this.updateEquity(e.timestamp));
    });
  }
  order(props: SimpleOrderProps): OrderStream {
    if (!includesCurrency(symbol, this.currency)) {
      throw new Error(
        `symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }

    const stream = new DebugOrderStream(props);
    const prices = this.spotPrices({symbol: props.symbol})
    if(props.tradeSide === "BUY") {
    const prices = this.spotPrices({ symbol: props.symbol });
    if (props.tradeSide === "BUY") {
      // entry price: last ask price
      prices.on("bid", () => {
        // update profit and loss
      });
    } else if (props.tradeSide === "SELL") {
      // entry price: last bid price
      prices.on("ask", () => {
        // update profit and loss
      });
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
    const e: EquityChangedEvent = { equity: this.equity, timestamp };
    this.emitEquity(e);
  }
}

const name = "BTC/EUR";
const symbol = Symbol.for(name);
const currency = Symbol.for("EUR");
const data = fromFile("./store/samples.json");
const spots = spotPrices(symbol, data);
const account = new LocalAccountStream({ currency }, 1000, spots);
setImmediate(() => {
  account.spotPrices({ symbol });
});
setImmediate(() => {
  account.order({ id: "1", symbol, tradeSide: "BUY" });
});
