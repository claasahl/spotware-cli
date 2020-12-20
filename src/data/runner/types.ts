import {
  ProtoOAAsset,
  ProtoOAAssetClass,
  ProtoOALightSymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

export interface SymbolData {
  trader: ProtoOATrader;
  depositAsset: ProtoOAAsset;
  symbol: ProtoOALightSymbol;
  category: ProtoOASymbolCategory;
  assetClass: ProtoOAAssetClass;
  baseAsset: ProtoOAAsset;
  quoteAsset: ProtoOAAsset;
}
export type SymbolDataProcessor = (
  socket: SpotwareClientSocket,
  data: SymbolData
) => Promise<void>;
