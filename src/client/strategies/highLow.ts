import {
  Messages,
  ProtoOAOrderType,
  ProtoOAPayloadType,
  ProtoOASymbol,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import git from "isomorphic-git";
import fs from "fs";
import debug from "debug";

import * as utils from "../../utils";
import * as R from "../requests";
import ms from "ms";

const log = debug("spotware").extend("strategies").extend("high-low");

function stopOrder(
  options: Options,
  hl: utils.HighLowResults,
  oid: string,
  symbol: ProtoOASymbol,
  tradeSide: ProtoOATradeSide
) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    expirationOffset,
    riskInEur,
    convert,
    entry: E = 0.1,
    takeProfit: TP = 1.5,
    stopLoss: SL = 1.0,
    trailingStopLoss,
  } = options;
  const { digits, stepVolume = 100000 } = symbol;
  const orderType = ProtoOAOrderType.STOP;
  const comment = `${ProtoOAOrderType[orderType]}-${oid}`;
  const label = `${ProtoOAOrderType[orderType]}-${oid}`;

  const range = hl.high - hl.low;
  const entry =
    tradeSide === ProtoOATradeSide.SELL
      ? hl.low - range * E
      : hl.high + range * E;
  const stopPrice = utils.price(entry, digits);
  const takeProfit = utils.price(
    tradeSide === ProtoOATradeSide.SELL
      ? entry - range * TP
      : entry + range * TP,
    digits
  );
  const stopLoss = utils.price(
    tradeSide === ProtoOATradeSide.SELL
      ? entry + range * SL
      : entry - range * SL,
    digits
  );
  R.PROTO_OA_NEW_ORDER_REQ(socket, {
    ctidTraderAccountId,
    symbolId,
    orderType,
    tradeSide,
    volume: utils.volume(stopPrice, stopLoss, riskInEur, stepVolume, convert),
    stopPrice,
    stopLoss,
    takeProfit,
    trailingStopLoss,
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
  riskInEur: number;
  convert?: boolean;
  lowerThreshold: number;
  upperThreshold: number;
  entry?: number;
  takeProfit?: number;
  stopLoss?: number;
  trailingStopLoss?: boolean;
  expirationOffset: number;
}
export default async function strategy(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    lowerThreshold,
    upperThreshold,
  } = options;
  const HighLow = utils.highLow({
    ctidTraderAccountId,
    symbolId,
    period,
  });
  const details = await R.PROTO_OA_SYMBOL_BY_ID_REQ(socket, {
    ctidTraderAccountId,
    symbolId: [symbolId],
  });
  const symbol = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const bla = {
    crossedThreshold: false,
  };
  return (msg: Messages) => {
    const hl = HighLow(msg);

    if (msg.payloadType !== ProtoOAPayloadType.PROTO_OA_SPOT_EVENT) {
      return;
    } else if (msg.payload.ctidTraderAccountId !== ctidTraderAccountId) {
      return;
    } else if (msg.payload.symbolId !== symbolId) {
      return;
    }

    if (!hl) {
      return;
    }

    const offset = Date.now() - hl.timestamp;
    const crossedThreshold =
      offset >= lowerThreshold && offset <= upperThreshold;
    if (!bla.crossedThreshold && crossedThreshold) {
      log("%j", bla);
      stopOrder(options, hl, oid, symbol, ProtoOATradeSide.SELL);
      stopOrder(options, hl, oid, symbol, ProtoOATradeSide.BUY);
    }
    bla.crossedThreshold = crossedThreshold;
    log("%j", { offset, offsetHuma: ms(offset), hl, ...bla });
  };
}
