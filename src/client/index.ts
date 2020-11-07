import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";
import {
  ProtoOAExecutionType,
  ProtoOAOrder,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import ms from "ms";

import * as R from "./requests";
import * as M from "./macros";
import * as S from "./strategies";
import { Events } from "./events";

const log = debug("custom-client");
const host = process.env.host || "live.ctraderapi.com";
const port = Number(process.env.port) || 5035;
const useTLS = process.env.useTLS === "true";

const events = new Events();
const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
const event = useTLS ? "secureConnect" : "connect";
const s = new SpotwareClientSocket(socket);
socket.once(event, async () => R.PROTO_OA_VERSION_REQ(s, {}));
socket.once(event, async () => {
  const traders = await M.authenticate(s, {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
  await M.emitAccounts({ events, traders });
});

events.on("account", async (account) => {
  if (!account.authenticated || !account.depositAssetId) {
    return;
  }
  const { ctidTraderAccountId } = account;
  const result = await M.symbols(s, { ctidTraderAccountId });
  const symbols = result.symbols.filter(
    (s) =>
      s.baseAssetId === account.depositAssetId ||
      s.quoteAssetId === account.depositAssetId
  );
  await M.emitSymbols({ ...result, symbols, events, ctidTraderAccountId });
});

const ASSET_CLASSES = ["Forex", "Metals", "Crypto Currency"];
events.on("symbol", async (symbol) => {
  if (!ASSET_CLASSES.includes(symbol.assetClass)) {
    return;
  }
  log("%j", symbol);
  // if (symbol.symbolName !== "BTC/EUR") {
  //   return;
  // }
  const period = ProtoOATrendbarPeriod.H1;
  const loadThisMuchHistoricalData = "15d";
  s.on(
    "data",
    await S.insideBarMomentum({
      socket: s,
      ctidTraderAccountId: symbol.ctidTraderAccountId,
      symbolId: symbol.symbolId,
      period,
      expirationOffset: ms("24h"),
    })
  );
  await M.trendbars(s, {
    ctidTraderAccountId: symbol.ctidTraderAccountId,
    loadThisMuchHistoricalData,
    symbolId: symbol.symbolId,
    period,
  });
});

const bla = log.extend("TESTING");
function compare(openingOrder: ProtoOAOrder, closingOrder: ProtoOAOrder) {
  bla("comparing opening and closing orders. %j", {
    openingOrder,
    closingOrder,
  });
  if (closingOrder.orderType !== ProtoOAOrderType.STOP_LOSS_TAKE_PROFIT) {
    bla("closing order of unexpected type. %j", { openingOrder, closingOrder });
    return;
  }
  if (closingOrder.tradeData.tradeSide === closingOrder.tradeData.tradeSide) {
    bla("trade sides (of opening and closing orders) are identical. %j", {
      openingOrder,
      closingOrder,
    });
    return;
  }
  if (closingOrder.tradeData.symbolId !== closingOrder.tradeData.symbolId) {
    bla("symbols (of opening and closing orders) mismatch. %j", {
      openingOrder,
      closingOrder,
    });
    return;
  }

  const fixTakeProfit = openingOrder.takeProfit !== closingOrder.limitPrice;
  const fixStopLoss = openingOrder.stopLoss !== closingOrder.stopLoss;
  return {
    fixTakeProfit,
    fixStopLoss,
  };
}
const openingOrders = new Map<string, ProtoOAOrder>();
s.on("data", (msg) => {
  if (
    msg.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT &&
    msg.clientMsgId
  ) {
    const { executionType, order, ctidTraderAccountId } = msg.payload;
    const accepted = executionType === ProtoOAExecutionType.ORDER_ACCEPTED;
    const filled = executionType === ProtoOAExecutionType.ORDER_FILLED;
    const isClosingOrder = !!order?.closingOrder;

    if (!order) {
      return;
    }

    if (filled && !isClosingOrder) {
      // here we still have all the good stuff
      openingOrders.set(msg.clientMsgId, order);
    } else if (accepted && isClosingOrder) {
      const openingOrder = openingOrders.get(msg.clientMsgId);
      const closingOrder = order;
      if (!openingOrder) {
        return;
      }

      const result = compare(openingOrder, closingOrder);
      bla("compared opening and closing orders. %j", { result });
      const { positionId } = closingOrder;
      if (!result || !positionId) {
        return;
      }

      // if (result.fixStopLoss || result.fixTakeProfit) {
      //   bla("attempting to fix")
      //   setImmediate(async () => {
      //     try {
      //       await R.PROTO_OA_AMEND_POSITION_SLTP_REQ(s, {
      //         ctidTraderAccountId,
      //         positionId,
      //         stopLoss: result.fixStopLoss ? openingOrder.stopLoss : undefined,
      //         takeProfit: result.fixTakeProfit ? openingOrder.takeProfit : undefined
      //       })
      //     } catch (err) {
      //       bla("error while fixing")
      //     }
      //   })
      // }
    }
  }
});

// rule of thumb:
// - we want all custom events to be emitted on the same stream (i.e. global ordering / no stream merging)
// - keep prices in integer format for as long as possible, otherwise one will most likely accumulate rounding errors over time
// - only produce outputs for SMA (and similar) when enough data has been buffered (i.e. all required candles / trendbars)
// - stick original spotware messages and use utility functions to convert and accumulate high-level information
