import {
  SpotwareClientSocket,
  ProtoOAOrder,
  PROTO_OA_EXECUTION_EVENT,
  ProtoOAExecutionType,
  ProtoOAPayloadType,
  ProtoOAOrderType,
  ProtoOATradeSide,
  PROTO_OA_SPOT_EVENT,
} from "@claasahl/spotware-adapter";
import debug from "debug";

import * as R from "../requests";

const log = debug("broken-orders");

function collectOpeningOrders(
  msg: PROTO_OA_EXECUTION_EVENT,
  openingOrders: Map<string, ProtoOAOrder>
): void {
  const { clientMsgId } = msg;
  const { executionType, order } = msg.payload;
  const isAccepted = executionType === ProtoOAExecutionType.ORDER_ACCEPTED;
  const isOpeningOrder = !order?.closingOrder;

  if (order && isAccepted && isOpeningOrder && clientMsgId) {
    log("adding new order to list: %j", order);
    openingOrders.set(clientMsgId, order);
  }
}

function collectBrokenOrders(
  msg: PROTO_OA_EXECUTION_EVENT,
  openingOrders: Map<string, ProtoOAOrder>,
  brokenOrders: Map<string, ProtoOAOrder>
): void {
  const { clientMsgId } = msg;
  const { executionType, order: closingOrder } = msg.payload;
  const isAccepted = executionType === ProtoOAExecutionType.ORDER_ACCEPTED;
  const isClosingOrder = !!closingOrder?.closingOrder;
  const openingOrder = openingOrders.get(clientMsgId || "");

  if (
    !closingOrder ||
    !isAccepted ||
    !isClosingOrder ||
    !clientMsgId ||
    !openingOrder
  ) {
    return;
  }

  log("comparing opening and closing orders: %j", {
    openingOrder,
    closingOrder,
  });
  if (closingOrder.orderType !== ProtoOAOrderType.STOP_LOSS_TAKE_PROFIT) {
    log("closing order of unexpected typ:. %j", {
      type: ProtoOAOrderType[closingOrder.orderType],
      openingOrder,
      closingOrder,
    });
    return;
  }
  if (openingOrder.tradeData.tradeSide === closingOrder.tradeData.tradeSide) {
    log("trade sides (of opening and closing orders) are identical: %j", {
      openingOrder: ProtoOATradeSide[openingOrder.tradeData.tradeSide],
      closingOrder: ProtoOATradeSide[closingOrder.tradeData.tradeSide],
    });
    return;
  }
  if (openingOrder.tradeData.symbolId !== closingOrder.tradeData.symbolId) {
    log("symbols (of opening and closing orders) mismatch: %j", {
      openingOrder: openingOrder.tradeData.symbolId,
      closingOrder: closingOrder.tradeData.symbolId,
    });
    return;
  }

  const fixTakeProfit = openingOrder.takeProfit !== closingOrder.limitPrice;
  const fixStopLoss = openingOrder.stopLoss !== closingOrder.stopLoss;
  if (fixStopLoss || fixTakeProfit) {
    log("adding 'broken' order to list: %j %j", openingOrder, {
      fixStopLoss,
      fixTakeProfit,
    });
    brokenOrders.set(clientMsgId, openingOrder);
  }
}

function cleanupOrders(
  msg: PROTO_OA_EXECUTION_EVENT,
  orders: Map<string, ProtoOAOrder>
): void {
  const { clientMsgId } = msg;
  const { executionType, order } = msg.payload;
  const isFilled = executionType === ProtoOAExecutionType.ORDER_FILLED;
  const isClosingOrder = !!order?.closingOrder;

  if (order && isFilled && isClosingOrder && clientMsgId) {
    log("removing order from list: %j", order);
    orders.delete(clientMsgId);
  }
}

async function fixOrder(
  socket: SpotwareClientSocket,
  ctidTraderAccountId: number,
  order: ProtoOAOrder
): Promise<boolean> {
  const { positionId } = order;
  if (!positionId) {
    return false;
  }
  try {
    await R.PROTO_OA_AMEND_POSITION_SLTP_REQ(socket, {
      ctidTraderAccountId,
      positionId,
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
    });
    return true;
  } catch (err) {
    log("failed to fix order: %j", order);
    log("error while fixing order: %s", err);
    return false;
  }
}

async function fixOrders(
  msg: PROTO_OA_SPOT_EVENT,
  socket: SpotwareClientSocket,
  brokenOrders: Map<string, ProtoOAOrder>
): Promise<void> {
  const { ctidTraderAccountId, bid, ask, symbolId } = msg.payload;
  if (!ctidTraderAccountId) {
    return;
  }
  const fixedOrders: string[] = [];
  for (const [clientMsgId, order] of brokenOrders) {
    if (order.tradeData.symbolId !== symbolId) {
      continue;
    }

    if (order.tradeData.tradeSide === ProtoOATradeSide.BUY && bid) {
      const {
        stopLoss = Number.MAX_VALUE,
        takeProfit = Number.MIN_VALUE,
      } = order;
      if (bid > stopLoss && bid < takeProfit) {
        log("attempting to fix order: %j", order);
        const fixed = await fixOrder(socket, ctidTraderAccountId, order);
        if (fixed) {
          fixedOrders.push(clientMsgId);
        }
      }
    } else if (order.tradeData.tradeSide === ProtoOATradeSide.SELL && ask) {
      const {
        stopLoss = Number.MIN_VALUE,
        takeProfit = Number.MAX_VALUE,
      } = order;
      if (ask < stopLoss && ask > takeProfit) {
        log("attempting to fix order: %j", order);
        const fixed = await fixOrder(socket, ctidTraderAccountId, order);
        if (fixed) {
          fixedOrders.push(clientMsgId);
        }
      }
    }
  }

  if (fixedOrders.length > 0) {
    log("managed to fix %s order(s)", fixedOrders.length);
    fixedOrders.forEach((msgId) => brokenOrders.delete(msgId));
  }
}

export async function macro(socket: SpotwareClientSocket): Promise<void> {
  const openingOrders = new Map<string, ProtoOAOrder>();
  const brokenOrders = new Map<string, ProtoOAOrder>();
  socket.on("data", (msg) => {
    if (msg.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT) {
      collectOpeningOrders(msg, openingOrders);
      collectBrokenOrders(msg, openingOrders, brokenOrders);
      cleanupOrders(msg, openingOrders);
      cleanupOrders(msg, brokenOrders);
      log("status quo: %j", {
        openingOrders: openingOrders.size,
        brokenOrders: brokenOrders.size,
      });
    } else if (msg.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      setImmediate(() => fixOrders(msg, socket, brokenOrders));
    }
  });
}
