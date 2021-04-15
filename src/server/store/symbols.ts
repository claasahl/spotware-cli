import { ProtoOALightSymbol, ProtoOASymbol } from "@claasahl/spotware-adapter";

import * as ASSETS from "./assets";

const symbols: (ProtoOALightSymbol & ProtoOASymbol)[] = [
  Object.freeze({
    symbolId: 1,
    symbolName: "BTC/EUR",
    baseAssetId: ASSETS.BITCOIN.assetId,
    quoteAssetId: ASSETS.EUR.assetId,
    enabled: true,
    symbolCategoryId: 1,
    digits: 2,
    holiday: [],
    pipPosition: 5,
    schedule: [],
  }),
  Object.freeze({
    symbolId: 2,
    symbolName: "EURUSD",
    baseAssetId: ASSETS.EUR.assetId,
    quoteAssetId: ASSETS.USD.assetId,
    enabled: true,
    symbolCategoryId: 2,
    digits: 2,
    holiday: [],
    pipPosition: 5,
    schedule: [],
  }),
  Object.freeze({
    symbolId: 3,
    symbolName: "EURGBP",
    baseAssetId: ASSETS.EUR.assetId,
    quoteAssetId: ASSETS.GBP.assetId,
    enabled: false,
    symbolCategoryId: 3,
    digits: 2,
    holiday: [],
    pipPosition: 5,
    schedule: [],
  }),
  Object.freeze({
    symbolId: 4,
    symbolName: "XAGEUR",
    baseAssetId: ASSETS.XAG.assetId,
    quoteAssetId: ASSETS.EUR.assetId,
    enabled: false,
    symbolCategoryId: 4,
    digits: 2,
    holiday: [],
    pipPosition: 5,
    schedule: [],
  }),
];
export default symbols;
