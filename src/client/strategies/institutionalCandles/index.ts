import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import git from "isomorphic-git";
import fs from "fs";
import debug from "debug";

import * as utils from "../../../utils";
import * as R from "../../requests";
import { isTopIC, isBottomIC, isBetween } from "./utils";
import { Trendbar } from "../../../utils";

const log = debug("spotware")
  .extend("strategies")
  .extend("institutional-candles");

function marketOrder(
  options: Options,
  oid: string,
  tradeSide: ProtoOATradeSide
) {
  const { socket, ctidTraderAccountId, symbolId, expirationOffset } = options;
  const orderType = ProtoOAOrderType.MARKET;
  const comment = `${ProtoOAOrderType[orderType]}-${oid}`;
  const label = `${ProtoOAOrderType[orderType]}-${oid}`;

  R.PROTO_OA_NEW_ORDER_REQ(socket, {
    ctidTraderAccountId,
    symbolId,
    orderType,
    tradeSide,
    volume: 10000,
    relativeStopLoss: 10,
    relativeTakeProfit: 20,
    comment,
    label,
    expirationTimestamp: Date.now() + expirationOffset,
  });
}

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  expirationOffset: number;
}
export default async function strategy(options: Options) {
  const { ctidTraderAccountId, symbolId, period } = options;
  const buffer = utils.bufferedTrendbars({
    ctidTraderAccountId,
    symbolId,
    period,
    periods: 6,
  });
  const topICs: Trendbar[] = [];
  const bottomICs: Trendbar[] = [];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });

  return (msg: Messages) => {
    const { bars } = buffer(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    } else if (msg.payload.trendbar[0].period !== period) {
      return;
    } else if (bars.length !== 6) {
      return;
    }

    // keep track / remember ICs
    if (isTopIC(bars.slice(0, 5))) {
      const bar = bars[1];
      if (
        topICs.length === 0 ||
        topICs[topICs.length - 1].timestamp !== bar.timestamp
      ) {
        topICs.push(bar);
        log("%j", { msg: "found possible top IC", bar, bars });
      }
    }
    if (isBottomIC(bars.slice(0, 5))) {
      const bar = bars[1];
      if (
        bottomICs.length === 0 ||
        bottomICs[bottomICs.length - 1].timestamp !== bar.timestamp
      ) {
        bottomICs.push(bar);
        log("%j", { msg: "found possible bottom IC", bar, bars });
      }
    }

    // remove invalidated ICs
    const { close } = bars[bars.length - 1];
    const toBeRemovedTopICs = topICs
      .map((bar, index) => (bar.close < close ? index : undefined))
      .filter((index): index is number => typeof index === "number")
      .reverse();
    toBeRemovedTopICs.forEach((index) => {
      log("%j", { msg: "removing possible top IC", bar: topICs[index] });
      topICs.splice(index, 1);
    });
    const toBeRemovedBottomICs = bottomICs
      .map((bar, index) => (bar.close > close ? index : undefined))
      .filter((index): index is number => typeof index === "number")
      .reverse();
    toBeRemovedBottomICs.forEach((index) => {
      log("%j", { msg: "removing possible bottom IC", bar: bottomICs[index] });
      bottomICs.splice(index, 1);
    });

    // enter trades
    const enterTradesForTopIcs = topICs
      .map((bar, index) =>
        isBetween(close, bar.open, bar.close) ? index : undefined
      )
      .filter((index): index is number => typeof index === "number")
      .reverse();
    enterTradesForTopIcs.forEach((index) => {
      log("%j", {
        msg: "entering trade for possible top IC",
        bar: topICs[index],
      });
      topICs.splice(index, 1);
      marketOrder(options, oid, ProtoOATradeSide.SELL);
    });
    const enterTradesForBottomIcs = bottomICs
      .map((bar, index) =>
        isBetween(close, bar.open, bar.close) ? index : undefined
      )
      .filter((index): index is number => typeof index === "number")
      .reverse();
    enterTradesForBottomIcs.forEach((index) => {
      log("%j", {
        msg: "entering trade for possible bottom IC",
        bar: bottomICs[index],
      });
      bottomICs.splice(index, 1);
      marketOrder(options, oid, ProtoOATradeSide.BUY);
    });
  };
}
