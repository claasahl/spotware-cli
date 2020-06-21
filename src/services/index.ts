import { insideBarMomentumStrategy } from "./insideBarMomentumStrategy";
import config from "../config";
import { fromSomething } from "./spotware/account";
import { periodToMillis } from "../utils";
import {execFile} from "child_process";
import debug from "debug";

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

async function insideBarSpotware() {
  const currency = Symbol.for("EUR");
  const symbol = Symbol.for(config.symbol)
  const account = fromSomething({currency, ...config})
  const period = periodToMillis(config.period);
  const expiresIn = config.expirationOffset;
  insideBarMomentumStrategy({ ...config, account, symbol, period, expiresIn })
  account.resume(); // consume account events
}
insideBarSpotware();
