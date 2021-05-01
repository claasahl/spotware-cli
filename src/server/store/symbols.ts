import { ProtoOALightSymbol, ProtoOASymbol } from "@claasahl/spotware-adapter";

import * as ASSETS from "./assets";
import * as CATEGORIES from "./categories";

export const BTCEUR = Object.freeze({
  symbolId: 1,
  symbolName: "BTC/EUR",
  baseAssetId: ASSETS.BITCOIN.assetId,
  quoteAssetId: ASSETS.EUR.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.CRYTOS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});

export const EURUSD = Object.freeze({
  symbolId: 2,
  symbolName: "EURUSD",
  baseAssetId: ASSETS.EUR.assetId,
  quoteAssetId: ASSETS.USD.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.FOREX.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});

export const EURGBP = Object.freeze({
  symbolId: 3,
  symbolName: "EURGBP",
  baseAssetId: ASSETS.EUR.assetId,
  quoteAssetId: ASSETS.GBP.assetId,
  enabled: false,
  symbolCategoryId: CATEGORIES.FOREX.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});

export const XAGEUR = Object.freeze({
  symbolId: 4,
  symbolName: "XAGEUR",
  baseAssetId: ASSETS.XAG.assetId,
  quoteAssetId: ASSETS.EUR.assetId,
  enabled: false,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});

export const XAUUSD = Object.freeze({
  symbolId: 5,
  symbolName: "XAUUSD",
  baseAssetId: ASSETS.XAU.assetId,
  quoteAssetId: ASSETS.USD.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});
export const NZDUSD = Object.freeze({
  symbolId: 6,
  symbolName: "NZDUSD",
  baseAssetId: ASSETS.NZD.assetId,
  quoteAssetId: ASSETS.USD.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});
export const AUDUSD = Object.freeze({
  symbolId: 7,
  symbolName: "AUDUSD",
  baseAssetId: ASSETS.AUD.assetId,
  quoteAssetId: ASSETS.USD.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});
export const GBPUSD = Object.freeze({
  symbolId: 8,
  symbolName: "GBPUSD",
  baseAssetId: ASSETS.GBP.assetId,
  quoteAssetId: ASSETS.USD.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});
export const GBPJPY = Object.freeze({
  symbolId: 9,
  symbolName: "GBPJPY",
  baseAssetId: ASSETS.GBP.assetId,
  quoteAssetId: ASSETS.JPY.assetId,
  enabled: true,
  symbolCategoryId: CATEGORIES.METALS.id,
  digits: 2,
  holiday: [],
  pipPosition: 5,
  schedule: [],
});

const symbols: (ProtoOALightSymbol & ProtoOASymbol)[] = [
  BTCEUR,
  EURUSD,
  EURGBP,
  XAGEUR,

  XAUUSD,
  NZDUSD,
  AUDUSD,
  GBPUSD,
  GBPJPY,
];

export const symbolById = new Map<number, ProtoOALightSymbol & ProtoOASymbol>();
symbols.forEach((symbol) => symbolById.set(symbol.symbolId, symbol));

export default symbols;
