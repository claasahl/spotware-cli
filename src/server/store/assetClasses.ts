import { ProtoOAAssetClass } from "@claasahl/spotware-adapter";

export const FOREX = Object.freeze({ id: 1, name: "Forex" });
export const METALS = Object.freeze({ id: 2, name: "Metals" });
export const CRYPTO_CURRENCY = Object.freeze({
  id: 3,
  name: "Crypto Currency",
});
export const LITERALLY_ANYTHING = Object.freeze({
  id: 4,
  name: "Literally Anything",
});

const assetClasses: ProtoOAAssetClass[] = [
  FOREX,
  METALS,
  CRYPTO_CURRENCY,
  LITERALLY_ANYTHING,
];
export default assetClasses;
