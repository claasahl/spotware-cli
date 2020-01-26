import { EventEmitter } from "events";

import * as Account from "./account";
import * as Spots from "./spot";

export default {
  Account,
  Spots
};

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

const emitter = new EventEmitter();
const accountService = new Account.Debug(emitter);
accountService.balanceChanged(10);
accountService.balanceChanged(-1);
accountService.balanceChanged(5);
accountService.balanceChanged(-0.5);
accountService.equityChanged(4);
accountService.equityChanged(-7);
accountService.marginChanged(4);
accountService.marginChanged(-1);

const spotsService = new Spots.Debug(emitter);
spotsService.askPriceChanged(6.76);
spotsService.bidPriceChanged(55.6);
spotsService.askPriceChanged(33);
