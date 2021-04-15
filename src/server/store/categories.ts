import { ProtoOASymbolCategory } from "@claasahl/spotware-adapter";

import * as ASSET_CLASSES from "./assetClasses";

export const CRYTOS = Object.freeze({
  id: 1,
  name: "Crytos",
  assetClassId: ASSET_CLASSES.CRYPTO_CURRENCY.id,
});
export const FOREX = Object.freeze({
  id: 2,
  name: "Forex",
  assetClassId: ASSET_CLASSES.FOREX.id,
});
export const METALS = Object.freeze({
  id: 3,
  name: "Metals",
  assetClassId: ASSET_CLASSES.METALS.id,
});
export const SOMETHING = Object.freeze({
  id: 3,
  name: "Something",
  assetClassId: ASSET_CLASSES.LITERALLY_ANYTHING.id,
});

const categories: ProtoOASymbolCategory[] = [CRYTOS, FOREX, METALS, SOMETHING];
export default categories;
