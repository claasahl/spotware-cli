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

import * as utils from "../../utils";
import * as R from "../requests";
import ms from "ms";

interface Options {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  stopLossOffset: number;
  volumeInLots: number;
}
export default async function strategy(options: Options) {
  const {
    socket,
    ctidTraderAccountId,
    symbolId,
    period,
    stopLossOffset,
    volumeInLots,
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
  const { lotSize = 1 } = details.symbol[0];
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
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
    console.log("----", ms(offset), offset, JSON.stringify(hl));
  };
}
