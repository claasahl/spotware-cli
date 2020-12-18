import {
  ProtoOAAsset,
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";
import debug from "debug";

import {
  Options as AuthenticateOptions,
  macro as authenticate,
} from "../../client/macros/authenticate";
import * as R from "../../client/requests";

const log = debug("universe");

interface ConnectOptions {
  port: number;
  host: string;
  useTLS: boolean;
}
function connect({
  port,
  host,
  useTLS,
}: ConnectOptions): Promise<SpotwareClientSocket> {
  return new Promise((resolve) => {
    const socket = useTLS ? tlsConnect(port, host) : netConnect(port, host);
    const event = useTLS ? "secureConnect" : "connect";
    socket.once(event, () => resolve(new SpotwareClientSocket(socket)));
  });
}

interface SymbolData {
  trader: ProtoOATrader;
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

    const { assetClass } = await R.PROTO_OA_ASSET_CLASS_LIST_REQ(socket, {
      ctidTraderAccountId,
    });
    const assetClasses = new Map<number, ProtoOAAssetClass>();
    assetClass.forEach((assetClass) => {
      if (assetClass.id) {
        assetClasses.set(assetClass.id, assetClass);
      }
    });

    const { asset } = await R.PROTO_OA_ASSET_LIST_REQ(socket, {
      ctidTraderAccountId,
    });
    const assets = new Map<number, ProtoOAAsset>();
    asset.forEach((asset) => {
      assets.set(asset.assetId, asset);
    });

    const { symbolCategory } = await R.PROTO_OA_SYMBOL_CATEGORY_REQ(socket, {
      ctidTraderAccountId,
    });
    const symbolCategories = new Map<number, ProtoOASymbolCategory>();
    symbolCategory.forEach((symbolCategory) => {
      symbolCategories.set(symbolCategory.id, symbolCategory);
    });

    const { symbol: symbols } = await R.PROTO_OA_SYMBOLS_LIST_REQ(socket, {
      ctidTraderAccountId,
    });
    const numberOfTrackedSymbols = trackedSymbols.length;
    for (const symbol of symbols) {
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
      if (!category || !baseAsset || !quoteAsset) {
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
        symbol,
        category,
        assetClass,
        baseAsset,
        quoteAsset,
      };
      if (options.trackSymbol(data)) {
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
  log("done");
  socket.end();
}
main({
  trackSymbol: () => true,
});
