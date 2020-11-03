import { ProtoOATradeSide } from "@claasahl/spotware-adapter";
import { Trendbar } from "../utils";

export interface Order {
  enter: number;
  takeProfit: number;
  stopLoss: number;
  tradeSide: ProtoOATradeSide;
  expirationTimestamp?: number;
}
export function forsight(future: Trendbar[], order: Order): number | undefined {
  let entered = false;
  let profited = false;
  let lost = false;
  const { expirationTimestamp = Number.MAX_VALUE } = order;
  for (const b of future) {
    if (!entered) {
      const expired = b.timestamp >= expirationTimestamp;
      if (expired) {
        return 0;
      }
      entered = b.high >= order.enter && order.enter >= b.low;
    }
    if (entered) {
      profited = b.high >= order.takeProfit && order.takeProfit >= b.low;
      lost = b.high >= order.stopLoss && order.stopLoss >= b.low;
    }
    if (lost) {
      return -Math.abs(order.enter - order.stopLoss);
    }
    if (profited) {
      return Math.abs(order.takeProfit - order.stopLoss);
    }
  }

  if (!entered) {
    return 0;
  }

  const lastBar = future[future.length - 1];
  if (lastBar && order.tradeSide === ProtoOATradeSide.BUY) {
    return lastBar.close - order.enter;
  } else if (lastBar && order.tradeSide === ProtoOATradeSide.SELL) {
    return order.enter - lastBar.close;
  }
}
