import * as Account from "./account";
import * as Spots from "./spotPrices";
import { sampleData, spotPrices } from "./local/spotPrices";
import { LocalAccountStream } from "./local";

export default {
  Account,
  Spots
};

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

// each service should export a class that extends (and completes) its base implementation

function local() {
  const name = "BTC/EUR";
  const symbol = Symbol.for(name);
  const currency = Symbol.for("EUR");
  const spots = spotPrices(symbol, sampleData());
  const account = new LocalAccountStream({ currency, balance: 1000, spots });
  setImmediate(() => {
    account.spotPrices({ symbol });
  });
  setImmediate(() => {
    account.order({ id: "1", symbol, tradeSide: "SELL", volume: 1 });
  });
}
local();