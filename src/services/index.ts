import { EventEmitter } from "events";
import debug from "debug";
import { Subject } from "rxjs";

import * as Account from "./account";
import * as Spots from "./spot";

export default {
  Account,
  Spots
};

const logger = debug("main");

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

const sub = new Subject<
  Spots.AskPriceChangedEvent | Spots.BidPriceChangedEvent
>();
const spots = Spots.service(sub);
spots.subscribe(spot => logger("%j", spot));
sub.next({ type: Spots.SpotEvents.ASK, price: 1, timestamp: 1 });
sub.next({ type: Spots.SpotEvents.BID, price: 2, timestamp: 2 });
sub.next({ type: Spots.SpotEvents.ASK, price: 3, timestamp: 3 });
sub.next({ type: Spots.SpotEvents.ASK, price: 4, timestamp: 4 });
sub.next({ type: Spots.SpotEvents.ASK, price: 5, timestamp: 5 });
sub.next({ type: Spots.SpotEvents.ASK, price: 6, timestamp: 4 });
sub.next({ type: Spots.SpotEvents.ASK, price: 7, timestamp: 7 });
sub.next({ type: Spots.SpotEvents.ASK, price: 8, timestamp: 8 });
sub.next({ type: Spots.SpotEvents.ASK, price: 9, timestamp: 9 });
