import assert from "assert";
import {
  BalanceChangedEvent,
  EquityChangedEvent,
  DebugAccountStream,
  OrderEvent,
  AccountProps,
  SimpleOrderProps,
  SimpleSpotPricesProps
} from "../account";
import {
  DebugSpotPricesStream,
  SpotPricesStream,
  AskPriceChangedEvent,
  BidPriceChangedEvent,
  PriceChangedEvent
} from "../spotPrices";
import { Symbol, Currency, Price, Timestamp } from "../types";
import { OrderStream, DebugOrderStream } from "../order";
import { fromFile } from "./data";

function emitSpotPrices(
  stream: DebugSpotPricesStream,
  e: AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent
): void {
  if ("ask" in e && !("bid" in e)) {
    stream.emitAsk({ ask: e.ask, timestamp: e.timestamp });
  } else if (!("ask" in e) && "bid" in e) {
    stream.emitBid({ bid: e.bid, timestamp: e.timestamp });
  } else if ("ask" in e && "bid" in e) {
    stream.emitAsk({ ask: e.ask, timestamp: e.timestamp });
    stream.emitBid({ bid: e.bid, timestamp: e.timestamp });
    stream.emitPrice({ ask: e.ask, bid: e.bid, timestamp: e.timestamp });
  }
  setImmediate(() => stream.emit("next"));
}

function spotPrices(symbol: Symbol): SpotPricesStream {
  function emitNext() {
    data.next().then(a => {
      if (a.value) {
        emitSpotPrices(stream, a.value);
      }
    });
  }
  const data = fromFile("./store/samples.json");
  const stream = new DebugSpotPricesStream({ symbol });
  setImmediate(() => {
    stream.on("next", emitNext);
    emitNext();
  });
  return stream;
}

function includesCurrency(symbol: Symbol, currency: Currency): boolean {
  const matches = currency.toString().match(/Symbol\((.*)\)/);
  assert.ok(
    matches,
    `couldn't extract name of currency ${currency.toString()}`
  );
  assert.strictEqual(
    matches?.length,
    2,
    `there should have been exactly two matches, but ${matches?.length} was/were found`
  );
  return symbol.toString().includes(name);
}

class LocalAccountStream extends DebugAccountStream {
  private balance: Price = 0;
  private equity: Price = 0;
  constructor(props: AccountProps, initialBalance: Price) {
    super(props);
    this.balance = initialBalance;
    this.equity = initialBalance;
    this.updateBalance(Date.now());
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
      // entry price: last ask price
      prices.on("bid", () => {
        // update profit and loss
      })
    } else if(props.tradeSide === "SELL") {
      // entry price: last bid price
      prices.on("ask", () => {
        // update profit and loss
      })
    }
    
    const e: OrderEvent = { timestamp: Date.now() };
    this.emitOrder(e);
    return stream;
  }
  spotPrices(props: SimpleSpotPricesProps): SpotPricesStream {
    if (!includesCurrency(props.symbol, this.currency)) {
      throw new Error(
        `symbol ${symbol.toString()} does not involve currency ${this.currency.toString()}. This account only supports currency pairs with ${this.currency.toString()}.`
      );
    }
    const stream = spotPrices(props.symbol);
    setImmediate(() => {
      stream.on("ask", e => this.updateEquity(e.timestamp));
      stream.on("bid", e => this.updateEquity(e.timestamp));
    });
    return stream;
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
const account = new LocalAccountStream({ currency }, 1000);
setImmediate(() => {
  account.spotPrices({ symbol });
});
setImmediate(() => {
  account.order({ id: "1", symbol, tradeSide: "BUY" });
});
