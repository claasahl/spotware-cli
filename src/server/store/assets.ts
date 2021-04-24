import { ProtoOAAsset } from "@claasahl/spotware-adapter";

export const AUD = Object.freeze({
  assetId: 1,
  name: "AUD",
  displayName: "AUD",
  digits: 2,
});
export const CAD = Object.freeze({
  assetId: 2,
  name: "CAD",
  displayName: "CAD",
  digits: 2,
});
export const CHF = Object.freeze({
  assetId: 3,
  name: "CHF",
  displayName: "CHF",
  digits: 2,
});
export const EUR = Object.freeze({
  assetId: 4,
  name: "EUR",
  displayName: "EUR",
  digits: 2,
});
export const GBP = Object.freeze({
  assetId: 5,
  name: "GBP",
  displayName: "GBP",
  digits: 2,
});
export const JPY = Object.freeze({
  assetId: 6,
  name: "JPY",
  displayName: "JPY",
  digits: 0,
});
export const MXN = Object.freeze({
  assetId: 7,
  name: "MXN",
  displayName: "MXN",
  digits: 2,
});
export const NOK = Object.freeze({
  assetId: 8,
  name: "NOK",
  displayName: "NOK",
  digits: 2,
});
export const NZD = Object.freeze({
  assetId: 9,
  name: "NZD",
  displayName: "NZD",
  digits: 2,
});
export const SEK = Object.freeze({
  assetId: 10,
  name: "SEK",
  displayName: "SEK",
  digits: 2,
});
export const USD = Object.freeze({
  assetId: 11,
  name: "USD",
  displayName: "USD",
  digits: 2,
});
export const XAG = Object.freeze({
  assetId: 12,
  name: "XAG",
  displayName: "Gold",
  digits: 2,
});
export const XAU = Object.freeze({
  assetId: 13,
  name: "XAU",
  displayName: "Silver",
  digits: 2,
});
export const BITCOIN = Object.freeze({
  assetId: 14,
  name: "Bitcoin",
  digits: 2,
});

const assets: ProtoOAAsset[] = [
  AUD,
  CAD,
  CHF,
  EUR,
  GBP,
  JPY,
  MXN,
  NOK,
  NZD,
  SEK,
  USD,
  XAG,
  XAU,
  BITCOIN,
];
export default assets;
