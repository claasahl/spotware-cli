import { ProtoOATrader } from "@claasahl/spotware-adapter";

import { Events } from "../events";

export interface Options {
  events: Events;
  traders: ProtoOATrader[];
}

export async function macro(options: Options): Promise<void> {
  const { events, traders } = options;
  for (const trader of traders) {
    events.emit("account", {
      ctidTraderAccountId: trader.ctidTraderAccountId,
      authenticated: true,
      depositAssetId: trader.depositAssetId,
    });
  }
}
