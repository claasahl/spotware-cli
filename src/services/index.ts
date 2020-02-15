import * as Account from "./account";
import * as Spots from "./spotPrices";

export default {
  Account,
  Spots
};


// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

