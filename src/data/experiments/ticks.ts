import fs from "fs";
import path from "path";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
import * as R from "../../client/requests";
import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";
import { SpotwareClientSocket } from "@claasahl/spotware-adapter";

type SaveTickDataOptions = {
  socket: SpotwareClientSocket;
  ctidTraderAccountId: number;
  symbolId: number;
  symbolName: string;
  type: ProtoOAQuoteType;
  fromTimestamp: number;
  toTimestamp: number;
  path: string;
};

async function saveTickData(options: SaveTickDataOptions): Promise<void> {
  const step = 604800000;
  const { ctidTraderAccountId, symbolId, type } = options;
  let { toTimestamp } = options;
  let hasMore = true;
  do {
    const fromTimestamp = Math.max(
      options.toTimestamp - step,
      options.fromTimestamp
    );
    const response = await R.PROTO_OA_GET_TICKDATA_REQ(options.socket, {
      ctidTraderAccountId,
      symbolId,
      type,
      fromTimestamp,
      toTimestamp,
    });

    if (response.tickData.length > 0) {
      toTimestamp = response.tickData[0].timestamp;

      const tickData = response.tickData;
      for (let i = 1; i < tickData.length; i++) {
        tickData[i].timestamp =
          tickData[i - 1].timestamp + tickData[i].timestamp;
        tickData[i].tick = tickData[i - 1].tick + tickData[i].tick;
      }

      const data = JSON.stringify(tickData);
      const index = {
        symbolId: options.symbolId,
        symbolName: options.symbolName,
        fromTimestamp: tickData[0].timestamp,
        toTimestamp: tickData[tickData.length - 1].timestamp,
        type: options.type,
      };
      const filename =
        Buffer.from(JSON.stringify(index)).toString("base64") + ".json";
      await fs.promises.writeFile(path.join(options.path, filename), data);
    }

    hasMore = response.hasMore;
  } while (hasMore);
}

interface Options {
  processSymbol: (data: SymbolData) => boolean;
  fromDate: Date;
  toDate: Date;
}
function processor(options: Options): SymbolDataProcessor {
  return async (socket, data) => {
    if (!options.processSymbol(data)) {
      return;
    }

    // prepare dir
    const symbolName = data.symbol.symbolName?.replace("/", "") || "";
    const dir = `${symbolName}.DB`;
    try {
      await fs.promises.mkdir(dir, { recursive: true });
    } catch {
      // ignore... for now
    }

    // fetch data
    await saveTickData({
      socket,
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      symbolId: data.symbol.symbolId,
      symbolName,
      fromTimestamp: options.fromDate.getTime(),
      toTimestamp: options.toDate.getTime(),
      type: ProtoOAQuoteType.ASK,
      path: dir,
    });
    await saveTickData({
      socket,
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      symbolId: data.symbol.symbolId,
      symbolName,
      fromTimestamp: options.fromDate.getTime(),
      toTimestamp: options.toDate.getTime(),
      type: ProtoOAQuoteType.BID,
      path: dir,
    });
  };
}
export default processor;
