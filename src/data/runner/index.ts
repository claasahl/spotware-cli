export * from "./types";

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
  fetchAsset,
  fetchAssetClass,
  fetchSymbolCategory,
} from "./utils";
import { SymbolData, SymbolDataProcessor } from "./types";

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
  "millis",
];

const csvData = (data: SymbolData, millis: number) => [
  data.trader.ctidTraderAccountId,
  data.depositAsset.name,
  data.trader.brokerName,
  data.assetClass.name,
  data.symbol.symbolName,
  data.symbol.enabled,
  data.symbol.description,
  data.baseAsset.name,
  data.quoteAsset.name,
  millis,
];

export interface Options {
  process: SymbolDataProcessor;
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

  for (const trader of traders) {
    const assetClasses = await fetchAssetClasses(socket, trader);
    const assets = await fetchAssets(socket, trader);
    const symbolCategories = await fetchSymbolCategories(socket, trader);
    const symbols = await fetchSymbols(socket, trader);

    for (const [_, symbol] of symbols) {
      const category = fetchSymbolCategory(
        symbolCategories,
        symbol.symbolCategoryId
      );
      const baseAsset = fetchAsset(assets, symbol.baseAssetId);
      const quoteAsset = fetchAsset(assets, symbol.quoteAssetId);
      const depositAsset = fetchAsset(assets, trader.depositAssetId);
      const assetClass = fetchAssetClass(assetClasses, category.assetClassId);

      const data: SymbolData = {
        trader,
        depositAsset,
        symbol,
        category,
        assetClass,
        baseAsset,
        quoteAsset,
      };
      const timeStart = Date.now();
      await options.process(socket, data);
      const timeEnd = Date.now();
      stream.write(csvData(data, timeEnd - timeStart));
    }
  }
  stream.end();
  log("wrote summary to %s", filename);
  log("done");
  socket.end();
}
