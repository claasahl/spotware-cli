import { fromSampleData } from "./local/spotPrices";
import { LocalAccountStream } from "./local";

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services (separation of concern)

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

// each service should export a class that extends (and completes) its base implementation
// alternatively, new services may be introduced through factory/creator-functions

function local() {
  const name = "BTC/EUR";
  const symbol = Symbol.for(name);
  const currency = Symbol.for("EUR");
  const spots = fromSampleData({ symbol })
  const account = new LocalAccountStream({ currency, balance: 1000, spots });
  setImmediate(() => {
    account.spotPrices({ symbol });
  });
  setImmediate(() => {
    account.order({ id: "1", symbol, tradeSide: "BUY", volume: 1 });
  });
}
local();