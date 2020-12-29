import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "./types";
import * as R from "../../client/requests";
import {
  ProtoOADeal,
  ProtoOADealStatus,
  ProtoOATradeSide,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

function boundaries(options: Pick<Options, "fromDate" | "toDate">): number[] {
  const fromTimestamp = options.fromDate.getTime();
  const toTimestamp = options.toDate.getTime();
  const boundaries: number[] = [fromTimestamp];
  const step = 604800000;
  while (boundaries[boundaries.length - 1] + step < toTimestamp) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }
  boundaries.push(toTimestamp);
  return boundaries;
}

async function fetchDeals(
  socket: SpotwareClientSocket,
  data: SymbolData,
  options: Options
): Promise<ProtoOADeal[]> {
  const deals: ProtoOADeal[] = [];
  const ctidTraderAccountId = data.trader.ctidTraderAccountId;
  const tmp = boundaries(options);
  for (let i = 1; i < tmp.length; i++) {
    const fromTimestamp = tmp[i - 1];
    const toTimestamp = tmp[i];
    const result = await R.PROTO_OA_DEAL_LIST_REQ(socket, {
      ctidTraderAccountId,
      fromTimestamp,
      toTimestamp,
    });
    if (result.hasMore) {
      throw new Error(
        `failed to fetch all deals between ${options.fromDate.toISOString()} and ${options.toDate.toISOString()}`
      );
    }
    deals.push(
      ...result.deal.filter((d) => d.symbolId === data.symbol.symbolId)
    );
  }
  return deals;
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
    const deals = await fetchDeals(socket, data, options);

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const filename = `./deals-${symbol}-${oid}.json`;
    await fs.promises.writeFile(
      filename,
      JSON.stringify(
        {
          data,
          deals: deals.map((d) => ({
            ...d,
            createTimestamp: new Date(d.createTimestamp),
            executionTimestamp: new Date(d.executionTimestamp),
            utcLastUpdateTimestamp:
              d.utcLastUpdateTimestamp && new Date(d.utcLastUpdateTimestamp),
            tradeSide: ProtoOATradeSide[d.tradeSide],
            dealStatus: ProtoOADealStatus[d.dealStatus],
          })),
        },
        null,
        2
      )
    );
  };
}

export default processor;
