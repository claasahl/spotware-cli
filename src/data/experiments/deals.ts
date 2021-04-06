import fs from "fs";
import git from "isomorphic-git";

import { SymbolData, SymbolDataProcessor } from "../runner/types";
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

interface GroupedDeal {
  tradeSide: string;
  volume: number;
  profit: number;

  entryPrice: number;
  entryTimestamp: number;
  entryDate: Date;
  entryDealStatus: string;

  closePrice: number;
  closeTimestamp: number;
  closedDate: Date;
  closeDealStatus: string;

  open: ProtoOADeal;
  close: ProtoOADeal;
}
function groupDealsByPosition(deals: ProtoOADeal[]): GroupedDeal[] {
  const grouped = new Map<number, Partial<GroupedDeal>>();
  for (const deal of deals) {
    const { positionId } = deal;
    if (!grouped.has(positionId)) {
      grouped.set(positionId, {});
    }

    const groupedDeal = grouped.get(positionId);
    if (!groupedDeal) {
      continue;
    }
    if (deal.closePositionDetail) {
      groupedDeal.close = deal;
    } else {
      groupedDeal.open = deal;
    }
  }
  return Array.from(grouped.values())
    .filter(
      (g): g is Pick<GroupedDeal, "close" | "open"> => !!g.close && !!g.open
    )
    .map((g) => ({
      ...g,
      tradeSide: ProtoOATradeSide[g.open.tradeSide],
      volume: g.open.volume,
      profit: g.close.closePositionDetail?.grossProfit || 0,

      entryPrice: 100000 * (g.open.executionPrice || 0),
      entryTimestamp: g.open.executionTimestamp,
      entryDate: new Date(g.open.executionTimestamp),
      entryDealStatus: ProtoOADealStatus[g.open.dealStatus],

      closePrice: 100000 * (g.close.executionPrice || 0),
      closeTimestamp: g.close.executionTimestamp,
      closedDate: new Date(g.close.executionTimestamp),
      closeDealStatus: ProtoOADealStatus[g.close.dealStatus],
    }));
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
    const symbolDetails = await R.PROTO_OA_SYMBOL_BY_ID_REQ(socket, {
      ctidTraderAccountId: data.trader.ctidTraderAccountId,
      symbolId: [data.symbol.symbolId],
    });
    const deals = await fetchDeals(socket, data, options);
    const groupedDeals = groupDealsByPosition(deals);

    // write JSON file
    const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
    const symbol = data.symbol.symbolName?.replace("/", "");
    const ctid = data.trader.ctidTraderAccountId;
    const filename = `./deals-${symbol}-${ctid}-${oid}.json`;
    await fs.promises.writeFile(
      filename,
      JSON.stringify(
        {
          data: { ...data, symbolDetails },
          deals: groupedDeals,
        },
        null,
        2
      )
    );
  };
}

export default processor;
