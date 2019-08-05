import {
  ProtoMessages,
  ProtoOAOrderType,
  ProtoOATradeSide,
  ProtoOATrendbarPeriod,
  ProtoOAQuoteType
} from "@claasahl/spotware-adapter";

import CONFIG from "./config";
import * as pm from "./utils/protoMessages";

const { clientId, clientSecret, accessToken } = CONFIG;
const ctidTraderAccountId = 5291983;

const toTimestamp = new Date("2019-07-24T18:30:00.000Z").getTime(); //Date.now();
const fromTimestamp = new Date("2019-07-24T18:20:00.000Z").getTime(); //toTimestamp - ms("1min");

const orderId = 123;
const positionId = 123;
const volume = 100;
// symbolIDs
const BTCEUR = 22396;

export const PROTO_OA_APPLICATION_AUTH_REQ: ProtoMessages = pm.pm2100({
  clientId,
  clientSecret
});
//export const PROTO_OA_APPLICATION_AUTH_RES: ProtoMessages = {    payloadType: 2101,    payload: {}};
export const PROTO_OA_ACCOUNT_AUTH_REQ: ProtoMessages = pm.pm2102({
  ctidTraderAccountId,
  accessToken
});
//export const PROTO_OA_ACCOUNT_AUTH_RES: ProtoMessages = {    payloadType: 2103,    payload: { ctidTraderAccountId }};
export const PROTO_OA_VERSION_REQ: ProtoMessages = pm.pm2104({});
// export const PROTO_OA_VERSION_RES: ProtoMessages = {payloadType: 2105, payload: {}}
export const PROTO_OA_NEW_ORDER_REQ: ProtoMessages = pm.pm2106({
  ctidTraderAccountId,
  orderType: ProtoOAOrderType.MARKET,
  symbolId: BTCEUR,
  tradeSide: ProtoOATradeSide.SELL,
  volume
});
//export const PROTO_OA_TRAILING_SL_CHANGED_EVENT: ProtoMessages = {payloadType: 2107, payload: {}}
export const PROTO_OA_CANCEL_ORDER_REQ: ProtoMessages = pm.pm2108({
  ctidTraderAccountId,
  orderId
});
export const PROTO_OA_AMEND_ORDER_REQ: ProtoMessages = pm.pm2109({
  ctidTraderAccountId,
  orderId
});
export const PROTO_OA_AMEND_POSITION_SLTP_REQ: ProtoMessages = pm.pm2110({
  ctidTraderAccountId,
  positionId
});
export const PROTO_OA_CLOSE_POSITION_REQ: ProtoMessages = pm.pm2111({
  ctidTraderAccountId,
  positionId,
  volume
});
export const PROTO_OA_ASSET_LIST_REQ: ProtoMessages = pm.pm2112({
  ctidTraderAccountId
});
//export const PROTO_OA_ASSET_LIST_RES: ProtoMessages = {payloadType: 2113, payload: {}}
export const PROTO_OA_SYMBOLS_LIST_REQ: ProtoMessages = pm.pm2114({
  ctidTraderAccountId
});
//export const PROTO_OA_SYMBOLS_LIST_RES: ProtoMessages = {payloadType: 2115, payload: {}}
export const PROTO_OA_SYMBOL_BY_ID_REQ: ProtoMessages = pm.pm2116({
  ctidTraderAccountId,
  symbolId: [BTCEUR]
});
//export const PROTO_OA_SYMBOL_BY_ID_RES: ProtoMessages = {payloadType: 2117, payload: {}}
export const PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ: ProtoMessages = pm.pm2118({
  ctidTraderAccountId,
  firstAssetId: 10,
  lastAssetId: 124651
});
//export const PROTO_OA_SYMBOLS_FOR_CONVERSION_RES: ProtoMessages = {payloadType: 2119, payload: {}}
//export const PROTO_OA_SYMBOL_CHANGED_EVENT: ProtoMessages = {payloadType: 2120, payload: {}}
export const PROTO_OA_TRADER_REQ: ProtoMessages = pm.pm2121({
  ctidTraderAccountId
});
//export const PROTO_OA_TRADER_RES: ProtoMessages = {payloadType: 2122, payload: {}}
//export const PROTO_OA_TRADER_UPDATE_EVENT: ProtoMessages = {payloadType: 2123, payload: {}}
export const PROTO_OA_RECONCILE_REQ: ProtoMessages = pm.pm2124({
  ctidTraderAccountId
});
//export const PROTO_OA_RECONCILE_RES: ProtoMessages = {payloadType: 2125, payload: {}}
//export const PROTO_OA_EXECUTION_EVENT: ProtoMessages = {payloadType: 2126, payload: {}}
export const PROTO_OA_SUBSCRIBE_SPOTS_REQ: ProtoMessages = pm.pm2127({
  ctidTraderAccountId,
  symbolId: [BTCEUR]
});
//export const PROTO_OA_SUBSCRIBE_SPOTS_RES: ProtoMessages = {payloadType: 2128, payload: {}}
export const PROTO_OA_UNSUBSCRIBE_SPOTS_REQ: ProtoMessages = pm.pm2129({
  ctidTraderAccountId,
  symbolId: [BTCEUR]
});
//export const PROTO_OA_UNSUBSCRIBE_SPOTS_RES: ProtoMessages = {payloadType: 2130, payload: {}}
//export const PROTO_OA_SPOT_EVENT: ProtoMessages = {payloadType: 2131, payload: {}}
//export const PROTO_OA_ORDER_ERROR_EVENT: ProtoMessages = {payloadType: 2132, payload: {}}
export const PROTO_OA_DEAL_LIST_REQ: ProtoMessages = pm.pm2133({
  ctidTraderAccountId,
  fromTimestamp,
  toTimestamp
});
//export const PROTO_OA_DEAL_LIST_RES: ProtoMessages = {payloadType: 2134, payload: {}}
export const PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ: ProtoMessages = pm.pm2135({
  ctidTraderAccountId,
  symbolId: BTCEUR,
  period: ProtoOATrendbarPeriod.M1
});
export const PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ: ProtoMessages = pm.pm2136({
  ctidTraderAccountId,
  symbolId: 1,
  period: ProtoOATrendbarPeriod.D1
});
export const PROTO_OA_GET_TRENDBARS_REQ: ProtoMessages = pm.pm2137({
  ctidTraderAccountId,
  fromTimestamp,
  toTimestamp,
  symbolId: BTCEUR,
  period: ProtoOATrendbarPeriod.M1
});
//export const PROTO_OA_GET_TRENDBARS_RES: ProtoMessages = {payloadType: 2138, payload: {}}
export const PROTO_OA_EXPECTED_MARGIN_REQ: ProtoMessages = pm.pm2139({
  ctidTraderAccountId,
  symbolId: BTCEUR,
  volume: [volume]
});
//export const PROTO_OA_EXPECTED_MARGIN_RES: ProtoMessages = {payloadType: 2140, payload: {}}
//export const PROTO_OA_MARGIN_CHANGED_EVENT: ProtoMessages = {payloadType: 2141, payload: {}}
//export const PROTO_OA_ERROR_RES: ProtoMessages = {payloadType: 2142, payload: {}}
export const PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ: ProtoMessages = pm.pm2143({
  ctidTraderAccountId,
  fromTimestamp,
  toTimestamp
});
//export const PROTO_OA_CASH_FLOW_HISTORY_LIST_RES: ProtoMessages = {payloadType: 2144, payload: {}}
export const PROTO_OA_GET_TICKDATA_REQ: ProtoMessages = pm.pm2145({
  ctidTraderAccountId,
  fromTimestamp,
  toTimestamp,
  symbolId: 1,
  type: ProtoOAQuoteType.BID
});
//export const PROTO_OA_GET_TICKDATA_RES: ProtoMessages = {payloadType: 2146, payload: {}}
//export const PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT: ProtoMessages = {payloadType: 2147, payload: {}}
//export const PROTO_OA_CLIENT_DISCONNECT_EVENT: ProtoMessages = {payloadType: 2148, payload: {}}
export const PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ: ProtoMessages = pm.pm2149(
  { accessToken }
);
//export const PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES: ProtoMessages = {payloadType: 2150, payload: {}}
export const PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ: ProtoMessages = pm.pm2151({
  accessToken
});
//export const PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES: ProtoMessages = {payloadType: 2152, payload: {}}
export const PROTO_OA_ASSET_CLASS_LIST_REQ: ProtoMessages = pm.pm2153({
  ctidTraderAccountId
});
//export const PROTO_OA_ASSET_CLASS_LIST_RES: ProtoMessages = {payloadType: 2154, payload: {}}
//export const PROTO_OA_DEPTH_EVENT: ProtoMessages = {payloadType: 2155, payload: {}}
export const PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ: ProtoMessages = pm.pm2156({
  ctidTraderAccountId,
  symbolId: [BTCEUR]
});
//export const PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES: ProtoMessages = {payloadType: 2157, payload: {}}
export const PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ: ProtoMessages = pm.pm2158({
  ctidTraderAccountId,
  symbolId: [BTCEUR]
});
//export const PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES: ProtoMessages = {payloadType: 2159, payload: {}}
export const PROTO_OA_SYMBOL_CATEGORY_REQ: ProtoMessages = pm.pm2160({
  ctidTraderAccountId
});
//export const PROTO_OA_SYMBOL_CATEGORY_RES: ProtoMessages = {payloadType: 2161, payload: {}}
export const PROTO_OA_ACCOUNT_LOGOUT_REQ: ProtoMessages = pm.pm2162({
  ctidTraderAccountId
});
//export const PROTO_OA_ACCOUNT_LOGOUT_RES: ProtoMessages = {payloadType: 2163, payload: {}}
//export const PROTO_OA_ACCOUNT_DISCONNECT_EVENT: ProtoMessages = {payloadType: 2164, payload: {}}
const samples: ProtoMessages[] = [
  PROTO_OA_APPLICATION_AUTH_REQ,
  //PROTO_OA_APPLICATION_AUTH_RES,
  PROTO_OA_ACCOUNT_AUTH_REQ,
  //PROTO_OA_ACCOUNT_AUTH_RES,
  PROTO_OA_VERSION_REQ,
  //PROTO_OA_VERSION_RES,
  PROTO_OA_NEW_ORDER_REQ,
  //PROTO_OA_TRAILING_SL_CHANGED_EVENT,
  PROTO_OA_CANCEL_ORDER_REQ,
  PROTO_OA_AMEND_ORDER_REQ,
  PROTO_OA_AMEND_POSITION_SLTP_REQ,
  PROTO_OA_CLOSE_POSITION_REQ,
  PROTO_OA_ASSET_LIST_REQ,
  //PROTO_OA_ASSET_LIST_RES,
  PROTO_OA_SYMBOLS_LIST_REQ,
  //PROTO_OA_SYMBOLS_LIST_RES,
  PROTO_OA_SYMBOL_BY_ID_REQ,
  //PROTO_OA_SYMBOL_BY_ID_RES,
  PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ,
  //PROTO_OA_SYMBOLS_FOR_CONVERSION_RES,
  //PROTO_OA_SYMBOL_CHANGED_EVENT,
  PROTO_OA_TRADER_REQ,
  //PROTO_OA_TRADER_RES,
  //PROTO_OA_TRADER_UPDATE_EVENT,
  PROTO_OA_RECONCILE_REQ,
  //PROTO_OA_RECONCILE_RES,
  //PROTO_OA_EXECUTION_EVENT,
  PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  //PROTO_OA_SUBSCRIBE_SPOTS_RES,
  PROTO_OA_UNSUBSCRIBE_SPOTS_REQ,
  //PROTO_OA_UNSUBSCRIBE_SPOTS_RES,
  //PROTO_OA_SPOT_EVENT,
  //PROTO_OA_ORDER_ERROR_EVENT,
  PROTO_OA_DEAL_LIST_REQ,
  //PROTO_OA_DEAL_LIST_RES,
  PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ,
  PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ,
  PROTO_OA_GET_TRENDBARS_REQ,
  //PROTO_OA_GET_TRENDBARS_RES,
  PROTO_OA_EXPECTED_MARGIN_REQ,
  //PROTO_OA_EXPECTED_MARGIN_RES,
  //PROTO_OA_MARGIN_CHANGED_EVENT,
  //PROTO_OA_ERROR_RES,
  PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ,
  //PROTO_OA_CASH_FLOW_HISTORY_LIST_RES,
  PROTO_OA_GET_TICKDATA_REQ,
  //PROTO_OA_GET_TICKDATA_RES,
  //PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT,
  //PROTO_OA_CLIENT_DISCONNECT_EVENT,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
  //PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES,
  PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ,
  //PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES,
  PROTO_OA_ASSET_CLASS_LIST_REQ,
  //PROTO_OA_ASSET_CLASS_LIST_RES,
  //PROTO_OA_DEPTH_EVENT,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
  //PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES,
  PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ,
  //PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES,
  PROTO_OA_SYMBOL_CATEGORY_REQ,
  //PROTO_OA_SYMBOL_CATEGORY_RES,
  PROTO_OA_ACCOUNT_LOGOUT_REQ
  //PROTO_OA_ACCOUNT_LOGOUT_RES,
  //PROTO_OA_ACCOUNT_DISCONNECT_EVENT
];

const payloadType = Number(process.argv[2]);
const sample = samples.filter(
  message => message.payloadType === payloadType
)[0];
console.log(JSON.stringify(sample));