import { fromSampleData, fromNothing, fromLogFiles } from "./local";
import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import config from "../config";
import { fromSomething } from "./spotware/account";
import { periodToMillis } from "../utils";
import ms from "ms";
import {execFile} from "child_process";
import debug from "debug";
import fs from "fs"
import readline from "readline";
import {obj as multistream} from "multistream";

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services (separation of concern)

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

// each service should export a class that extends (and completes) its base implementation
// alternatively, new services may be introduced through factory/creator-functions

// each service must expose a callback-function for every documented event, which provides access to the last event. The function must be named after the event.

// implement insideBarMomentumStrategy

// review all base/*.ts and local/*.ts files for "Promises vs callbacks" and "Promises vs 'sync' returns"

// philosophy: for awesome readablity format all events like so {timestamp, type, ...rest}

function header() {
  execFile("git", ["rev-parse", "HEAD"], (_error, stdout, _stderr) => {
    debug("CONFIG")("%j", {config, git: stdout, env: process.env})
  })
}
header();

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
  const initialBalance = 177.59;
  const period = ms("15min");
  const symbol = Symbol.for("BTC/EUR");
  const enterOffset = 0.1;
  const stopLossOffset = 0.4;
  const takeProfitOffset = 0.8;
  const minTrendbarRange = 15;
  const volume = 0.01;
  const expiresIn = ms("30min")
  const spots = () => fromLogFiles({paths: [
    "../../Downloads/logs/2020-06-18.log",
    "../../Downloads/logs/2020-06-19.log",
    "../../Downloads/logs/2020-06-20.log"
  ], symbol});
  const account = fromNothing({currency, initialBalance, spots})
  insideBarMomentumStrategy({ account, period, symbol, enterOffset, stopLossOffset, takeProfitOffset, minTrendbarRange, volume, expiresIn })
  account.resume(); // consume account events
}
insideBarLocal;

async function insideBarSpotware() {
  const currency = Symbol.for("EUR");
  const symbol = Symbol.for(config.symbol)
  const account = fromSomething({currency, ...config})
  const period = periodToMillis(config.period);
  const expiresIn = config.expirationOffset;
  insideBarMomentumStrategy({ ...config, account, symbol, period, expiresIn })
  account.resume(); // consume account events
}
insideBarSpotware;

async function spotware() {
  const currency = Symbol.for("EUR");
  const symbol = Symbol.for("BTC/EUR");
  const account = fromSomething({...config, currency})
  account.trendbars({symbol, period: 10000}).on("data", console.log)
  setTimeout(async () => {
    const stream = account.stopOrder({id: "1", symbol, tradeSide: "SELL", volume: 0.01, expiresAt: Date.now() + 10000, enter: 7000})
    stream.on("data", e => console.log("---", e));
    stream.on("end", () => console.log("--- END", ));
    stream.on("close", () => console.log("--- CLOSE", ));
    // stream.on("error", err => console.log("--- ERROR", err));
    setInterval(() => stream.endOrder(), 5000)
  }, 15000)
}
spotware;

async function review () {
  const fileStream = multistream([
    fs.createReadStream("../../Downloads/logs/2020-06-18.log"),
    fs.createReadStream("../../Downloads/logs/2020-06-19.log"),
    fs.createReadStream("../../Downloads/logs/2020-06-20.log")
    // fs.createReadStream('./dev copy.log')
  ])
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  const orders = new Map<string, any>()
  for await (const line of rl) {
    if(line.indexOf("account") >= 0) {
      const logEntry = /({.*})/.exec(line);
      const data = JSON.parse(logEntry![1])
      if("id" in data) {
        const id = data.id;
        if(!orders.has(id)) {
          orders.set(id, {})
        }
        const order = orders.get(id)!
        const fromTimestamp = Math.min(data.timestamp, order.fromTimestamp || Number.MAX_VALUE)
        const toTimestamp = Math.max(data.timestamp, order.toTimestamp || Number.MIN_VALUE)
        const from = new Date(fromTimestamp)
        const to = new Date(toTimestamp)
        const duration = ms(toTimestamp-fromTimestamp)
        
        delete data.type;
        delete data.timestamp;
        Object.assign(order, data, {fromTimestamp, toTimestamp, from, to, duration})
      }
    }
  }

  console.log(orders)
  const out = fs.createWriteStream("compare.csv")
  out.write(`id;type;tradeSide;volume;enter;stopLoss;takeProfit;fromTimestamp;from;toTimestamp;to;expiresTimestamp;expires;duration;entry;exit;price;profitLoss\n`)
  for(const [_id, data] of orders) {
      out.write(`${data.id};${data.orderType};${data.tradeSide};${data.volume};${data.enter};${data.stopLoss};${data.takeProfit};${data.fromTimestamp};${data.from.toISOString()};${data.toTimestamp};${data.to.toISOString()};${data.expiresAt};${new Date(data.expiresAt).toISOString()};${data.duration};${data.entry || ""};${data.exit || ""};${data.price || ""};${data.profitLoss || ""}\n`)
  }
  out.end();
}
review();