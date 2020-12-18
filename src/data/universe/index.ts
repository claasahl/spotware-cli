import {
  ProtoOAAsset,
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
} from "@claasahl/spotware-adapter";
import debug from "debug";
import fs from "fs";
import { format } from "@fast-csv/format";
import git from "isomorphic-git";

import { macro as authenticate } from "../../client/macros/authenticate";
import {
  connect,
  fetchAssetClasses,
  fetchAssets,
  fetchSymbolCategories,
  fetchSymbols,
} from "./utils";

const log = debug("universe");

const csvHeaders = [
  "ctidTraderAccountId",
  "depositAsset",
  "broker",
  "assetClass",
  "symbol",
  "enabled",
  "description",
  "baseAsset",
  "quoteAsset",
  "tracked",
];

const csvData = (data: SymbolData, tracked: boolean) => [
  data.trader.ctidTraderAccountId,
  data.depositAsset.name,
  data.trader.brokerName,
  data.assetClass.name,
  data.symbol.symbolName,
  data.symbol.enabled,
  data.symbol.description,
  data.baseAsset.name,
  data.quoteAsset.name,
  tracked,
];

interface SymbolData {
  trader: ProtoOATrader;
  depositAsset: ProtoOAAsset;
  symbol: ProtoOALightSymbol;
  category: ProtoOASymbolCategory;
  assetClass: ProtoOAAssetClass;
  baseAsset: ProtoOAAsset;
  quoteAsset: ProtoOAAsset;
}
type ExtendedSymbolData = SymbolData & {
  details: ProtoOASymbol;
};

export interface Options {
  trackSymbol: (data: SymbolData) => boolean;
}
export async function main(options: Options) {
  const [{ oid }] = await git.log({ fs, depth: 1, ref: "HEAD", dir: "." });
  const filename = `./overview-${oid}.csv`;
  const stream = format({ headers: csvHeaders });
  const output = fs.createWriteStream(filename);
  stream.pipe(output);
  log("writing summary to %s", filename);

  const connection = {
    host: process.env.host || "live.ctraderapi.com",
    port: Number(process.env.port) || 5035,
    useTLS: process.env.useTLS === "true",
  };
  const socket = await connect(connection);
  log("connected to %j", connection);

  const traders = await authenticate(socket, {
    clientId: process.env.clientId || "",
    clientSecret: process.env.clientSecret || "",
    accessToken: process.env.accessToken || "",
    refreshToken: process.env.refreshToken || "",
  });
  log("authenticated", { noOfTraders: traders.length });

  const trackedSymbols: SymbolData[] = [];
  for (const trader of traders) {
    const { ctidTraderAccountId } = trader;
    const assetClasses = await fetchAssetClasses(socket, trader);
    const assets = await fetchAssets(socket, trader);
    const symbolCategories = await fetchSymbolCategories(socket, trader);
    const symbols = await fetchSymbols(socket, trader);

    const numberOfTrackedSymbols = trackedSymbols.length;
    for (const [_, symbol] of symbols) {
      if (
        !symbol.baseAssetId ||
        !symbol.quoteAssetId ||
        !symbol.symbolCategoryId
      ) {
        log(
          "skipping symbol %s (%s) due to missing data",
          symbol.symbolName,
          symbol.symbolId
        );
        continue;
      }
      const category = symbolCategories.get(symbol.symbolCategoryId);
      const baseAsset = assets.get(symbol.baseAssetId);
      const quoteAsset = assets.get(symbol.quoteAssetId);
      const depositAsset = assets.get(trader.depositAssetId);
      if (!category || !baseAsset || !quoteAsset || !depositAsset) {
        log(
          "skipping symbol %s (%s) due to missing dependencies (#)",
          symbol.symbolName,
          symbol.symbolId
        );
        continue;
      }

      const assetClass = assetClasses.get(category.assetClassId);
      if (!assetClass) {
        log(
          "skipping symbol %s (%s) due to missing dependencies (+)",
          symbol.symbolName,
          symbol.symbolId
        );
        continue;
      }
      const data: SymbolData = {
        trader,
        depositAsset,
        symbol,
        category,
        assetClass,
        baseAsset,
        quoteAsset,
      };
      const tracked = options.trackSymbol(data);
      stream.write(csvData(data, tracked));
      if (tracked) {
        trackedSymbols.push(data);
      }
    }
    log(
      "tracking %s symbols for ctidTraderAccountId %s",
      trackedSymbols.length - numberOfTrackedSymbols,
      ctidTraderAccountId
    );
  }
  log("tracking %s symbols", trackedSymbols.length);
  stream.end();
  log("wrote summary to %s", filename);
  log("done");
  socket.end();
}
main({
  trackSymbol: (data) =>
    (data.assetClass.name === "Forex" &&
      data.symbol.symbolName?.includes(data.depositAsset.name)) ||
    false,
});
