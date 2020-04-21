import { fromSampleData, fromFile, fromNothing } from "./local";
import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import config from "../config";
import { fromSomething } from "./spotware/account";
import { periodToMillis } from "../utils";

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services (separation of concern)

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

// each service should export a class that extends (and completes) its base implementation
// alternatively, new services may be introduced through factory/creator-functions

// each service must expose a callback-function for every documented event, which provides access to the last event. The function must be named after the event.

// implement insideBarMomentumStrategy

// review all base/*.ts and local/*.ts files for "Promises vs callbacks" and "Promises vs 'sync' returns"

function local() {
  const name = "BTC/EUR";
  const symbol = Symbol.for(name);
  const currency = Symbol.for("EUR");
  const account = fromNothing({currency, spots: fromSampleData, initialBalance: 1000})
  setImmediate(() => {
    account.trendbars({ symbol, period: 2000 });
  });
  setImmediate(() => {
    // account.stopOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, enter: 6613});
    // account.marketOrder({ id: "1", symbol, tradeSide: "BUY", volume: 1, takeProfit: 6614.0});
    account.marketOrder({ id: "1", symbol, tradeSide: "SELL", volume: 1, stopLoss: 6613.0});
  });
}
local;

function insideBarLocal() {
  const currency = Symbol.for("EUR");
  const initialBalance = 1000;
  const period = 60000;
  const symbol = Symbol.for("BTC/EUR");
  const enterOffset = 0.1;
  const stopLossOffset = 0.4;
  const takeProfitOffset = 0.8;
  const minTrendbarRange = 15;
  const volume = 0.01;
  const expiresIn = 600000
  const spots = () => fromFile({path: "./store/test4.json", symbol});
  const account = fromNothing({currency, initialBalance, spots})
  insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn })
}
insideBarLocal;

async function insideBarSpotware() {
  const currency = Symbol.for("EUR");
  const symbol = Symbol.for(config.symbol)
  const account = fromSomething({currency, ...config})
  const period = periodToMillis(config.period);
  const expiresIn = config.expirationOffset;
  insideBarMomentumStrategy({ ...config, account, symbol, period, expiresIn })
}
insideBarSpotware();

async function spotware() {
  const currency = Symbol.for("EUR");
  const symbol = Symbol.for("BTC/EUR");
  const period = 1000;
  const account = fromSomething({...config, currency})
  await account.spotPrices({symbol})
  await account.trendbars({symbol, period})
  // const stream = await account.marketOrder({id: "1", symbol, tradeSide: "SELL", volume: 0.01})
  const stream = await account.stopOrder({id: "1", symbol, tradeSide: "SELL", volume: 0.01, enter: 6000})
  setTimeout(async () => {
    console.log(await stream.cancel())
  }, 10000)
}
spotware;