import {
  ProtoOAAsset,
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import { connect as tlsConnect } from "tls";
import { connect as netConnect } from "net";

import * as R from "../../client/requests";

interface ConnectOptions {
  port: number;
  host: string;
  useTLS: boolean;
}
export function connect({
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

export async function fetchAssetClasses(
  socket: SpotwareClientSocket,
  trader: ProtoOATrader
) {
  const { assetClass } = await R.PROTO_OA_ASSET_CLASS_LIST_REQ(socket, {
    ctidTraderAccountId: trader.ctidTraderAccountId,
  });
  const assetClasses = new Map<number, ProtoOAAssetClass>();
  assetClass.forEach((assetClass) => {
    if (assetClass.id) {
      assetClasses.set(assetClass.id, assetClass);
    }
  });
  return assetClasses;
}

export function fetchAssetClass(
  assetClasses: Map<number, ProtoOAAssetClass>,
  id?: number
) {
  if (!id) {
    throw new Error("missing asset class id");
  }
  const assetClass = assetClasses.get(id);
  if (assetClass) {
    return assetClass;
  }
  throw new Error("missing asset class");
}

export async function fetchAssets(
  socket: SpotwareClientSocket,
  trader: ProtoOATrader
) {
  const { asset } = await R.PROTO_OA_ASSET_LIST_REQ(socket, {
    ctidTraderAccountId: trader.ctidTraderAccountId,
  });
  const assets = new Map<number, ProtoOAAsset>();
  asset.forEach((asset) => {
    assets.set(asset.assetId, asset);
  });
  return assets;
}

export function fetchAsset(assets: Map<number, ProtoOAAsset>, id?: number) {
  if (!id) {
    throw new Error("missing asset id");
  }
  const asset = assets.get(id);
  if (asset) {
    return asset;
  }
  throw new Error("missing asset");
}

export async function fetchSymbolCategories(
  socket: SpotwareClientSocket,
  trader: ProtoOATrader
) {
  const { symbolCategory } = await R.PROTO_OA_SYMBOL_CATEGORY_REQ(socket, {
    ctidTraderAccountId: trader.ctidTraderAccountId,
  });
  const symbolCategories = new Map<number, ProtoOASymbolCategory>();
  symbolCategory.forEach((symbolCategory) => {
    symbolCategories.set(symbolCategory.id, symbolCategory);
  });
  return symbolCategories;
}

export function fetchSymbolCategory(
  symbolCategories: Map<number, ProtoOASymbolCategory>,
  id?: number
) {
  if (!id) {
    throw new Error("missing symbol category id");
  }
  const symbolCategory = symbolCategories.get(id);
  if (symbolCategory) {
    return symbolCategory;
  }
  throw new Error("missing symbol category");
}

export async function fetchSymbols(
  socket: SpotwareClientSocket,
  trader: ProtoOATrader
) {
  const { symbol } = await R.PROTO_OA_SYMBOLS_LIST_REQ(socket, {
    ctidTraderAccountId: trader.ctidTraderAccountId,
  });
  const symbols = new Map<number, ProtoOALightSymbol>();
  symbol.forEach((symbol) => {
    symbols.set(symbol.symbolId, symbol);
  });
  return symbols;
}
