import ms from "ms";

import * as $ from "./OpenApiMessages";
import { ProtoMessages } from ".";

const clientId = "";
const clientSecret = "";

const scopeAccount = {
  accessToken: "",
  refreshToken: ""
};
const scopeTrading = {
  accessToken: "",
  refreshToken: ""
};
const ctidTraderAccountId = 0;

const { accessToken, refreshToken } = scopeTrading;
const toTimestamp = Date.now();
const fromTimestamp = toTimestamp - ms("7d");

const orderId = 123;
const positionId = 123;
const volume = 100;
// symbolIDs
const EURUSD = 1;
const EURSEK = 47;
const BTCEUR = 22396;

export const PROTO_OA_APPLICATION_AUTH_REQ: ProtoMessages = {
  payloadType: 2100,
  payload: { clientId, clientSecret }
};
//export const PROTO_OA_APPLICATION_AUTH_RES: ProtoMessages = {    payloadType: 2101,    payload: {}};
export const PROTO_OA_ACCOUNT_AUTH_REQ: ProtoMessages = {
  payloadType: 2102,
  payload: { ctidTraderAccountId, accessToken }
};
//export const PROTO_OA_ACCOUNT_AUTH_RES: ProtoMessages = {    payloadType: 2103,    payload: { ctidTraderAccountId }};
export const PROTO_OA_VERSION_REQ: ProtoMessages = {
  payloadType: 2104,
  payload: {}
};
// export const PROTO_OA_VERSION_RES: ProtoMessages = {payloadType: 2105, payload: {}}
export const PROTO_OA_NEW_ORDER_REQ: ProtoMessages = {
  payloadType: 2106,
  payload: {
    ctidTraderAccountId,
    orderType: $.ProtoOAOrderType.MARKET,
    symbolId: BTCEUR,
    tradeSide: $.ProtoOATradeSide.SELL,
    volume
  }
};
//export const PROTO_OA_TRAILING_SL_CHANGED_EVENT: ProtoMessages = {payloadType: 2107, payload: {}}
export const PROTO_OA_CANCEL_ORDER_REQ: ProtoMessages = {
  payloadType: 2108,
  payload: { ctidTraderAccountId, orderId }
};
export const PROTO_OA_AMEND_ORDER_REQ: ProtoMessages = {
  payloadType: 2109,
  payload: { ctidTraderAccountId, orderId }
};
export const PROTO_OA_AMEND_POSITION_SLTP_REQ: ProtoMessages = {
  payloadType: 2110,
  payload: { ctidTraderAccountId, positionId }
};
export const PROTO_OA_CLOSE_POSITION_REQ: ProtoMessages = {
  payloadType: 2111,
  payload: { ctidTraderAccountId, positionId, volume }
};
export const PROTO_OA_ASSET_LIST_REQ: ProtoMessages = {
  payloadType: 2112,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_ASSET_LIST_RES: ProtoMessages = {payloadType: 2113, payload: {}}
export const PROTO_OA_SYMBOLS_LIST_REQ: ProtoMessages = {
  payloadType: 2114,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_SYMBOLS_LIST_RES: ProtoMessages = {payloadType: 2115, payload: {}}
export const PROTO_OA_SYMBOL_BY_ID_REQ: ProtoMessages = {
  payloadType: 2116,
  payload: { ctidTraderAccountId, symbolId: [BTCEUR] }
};
//export const PROTO_OA_SYMBOL_BY_ID_RES: ProtoMessages = {payloadType: 2117, payload: {}}
export const PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ: ProtoMessages = {
  payloadType: 2118,
  payload: { ctidTraderAccountId, firstAssetId: 10, lastAssetId: 124651 }
};
//export const PROTO_OA_SYMBOLS_FOR_CONVERSION_RES: ProtoMessages = {payloadType: 2119, payload: {}}
//export const PROTO_OA_SYMBOL_CHANGED_EVENT: ProtoMessages = {payloadType: 2120, payload: {}}
export const PROTO_OA_TRADER_REQ: ProtoMessages = {
  payloadType: 2121,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_TRADER_RES: ProtoMessages = {payloadType: 2122, payload: {}}
//export const PROTO_OA_TRADER_UPDATE_EVENT: ProtoMessages = {payloadType: 2123, payload: {}}
export const PROTO_OA_RECONCILE_REQ: ProtoMessages = {
  payloadType: 2124,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_RECONCILE_RES: ProtoMessages = {payloadType: 2125, payload: {}}
//export const PROTO_OA_EXECUTION_EVENT: ProtoMessages = {payloadType: 2126, payload: {}}
export const PROTO_OA_SUBSCRIBE_SPOTS_REQ: ProtoMessages = {
  payloadType: 2127,
  payload: { ctidTraderAccountId, symbolId: [BTCEUR] }
};
//export const PROTO_OA_SUBSCRIBE_SPOTS_RES: ProtoMessages = {payloadType: 2128, payload: {}}
export const PROTO_OA_UNSUBSCRIBE_SPOTS_REQ: ProtoMessages = {
  payloadType: 2129,
  payload: { ctidTraderAccountId, symbolId: [BTCEUR] }
};
//export const PROTO_OA_UNSUBSCRIBE_SPOTS_RES: ProtoMessages = {payloadType: 2130, payload: {}}
//export const PROTO_OA_SPOT_EVENT: ProtoMessages = {payloadType: 2131, payload: {}}
//export const PROTO_OA_ORDER_ERROR_EVENT: ProtoMessages = {payloadType: 2132, payload: {}}
export const PROTO_OA_DEAL_LIST_REQ: ProtoMessages = {
  payloadType: 2133,
  payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
};
//export const PROTO_OA_DEAL_LIST_RES: ProtoMessages = {payloadType: 2134, payload: {}}
export const PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ: ProtoMessages = {
  payloadType: 2135,
  payload: {
    ctidTraderAccountId,
    symbolId: 1,
    period: $.ProtoOATrendbarPeriod.D1
  }
};
export const PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ: ProtoMessages = {
  payloadType: 2136,
  payload: {
    ctidTraderAccountId,
    symbolId: 1,
    period: $.ProtoOATrendbarPeriod.D1
  }
};
export const PROTO_OA_GET_TRENDBARS_REQ: ProtoMessages = {
  payloadType: 2137,
  payload: {
    ctidTraderAccountId,
    fromTimestamp,
    toTimestamp,
    symbolId: BTCEUR,
    period: $.ProtoOATrendbarPeriod.D1
  }
};
//export const PROTO_OA_GET_TRENDBARS_RES: ProtoMessages = {payloadType: 2138, payload: {}}
export const PROTO_OA_EXPECTED_MARGIN_REQ: ProtoMessages = {
  payloadType: 2139,
  payload: { ctidTraderAccountId, symbolId: BTCEUR, volume: [volume] }
};
//export const PROTO_OA_EXPECTED_MARGIN_RES: ProtoMessages = {payloadType: 2140, payload: {}}
//export const PROTO_OA_MARGIN_CHANGED_EVENT: ProtoMessages = {payloadType: 2141, payload: {}}
//export const PROTO_OA_ERROR_RES: ProtoMessages = {payloadType: 2142, payload: {}}
export const PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ: ProtoMessages = {
  payloadType: 2143,
  payload: { ctidTraderAccountId, fromTimestamp, toTimestamp }
};
//export const PROTO_OA_CASH_FLOW_HISTORY_LIST_RES: ProtoMessages = {payloadType: 2144, payload: {}}
export const PROTO_OA_GET_TICKDATA_REQ: ProtoMessages = {
  payloadType: 2145,
  payload: {
    ctidTraderAccountId,
    fromTimestamp,
    toTimestamp,
    symbolId: BTCEUR,
    type: $.ProtoOAQuoteType.ASK
  }
};
//export const PROTO_OA_GET_TICKDATA_RES: ProtoMessages = {payloadType: 2146, payload: {}}
//export const PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT: ProtoMessages = {payloadType: 2147, payload: {}}
//export const PROTO_OA_CLIENT_DISCONNECT_EVENT: ProtoMessages = {payloadType: 2148, payload: {}}
export const PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ: ProtoMessages = {
  payloadType: 2149,
  payload: { accessToken }
};
//export const PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES: ProtoMessages = {payloadType: 2150, payload: {}}
export const PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ: ProtoMessages = {
  payloadType: 2151,
  payload: { accessToken }
};
//export const PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES: ProtoMessages = {payloadType: 2152, payload: {}}
export const PROTO_OA_ASSET_CLASS_LIST_REQ: ProtoMessages = {
  payloadType: 2153,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_ASSET_CLASS_LIST_RES: ProtoMessages = {payloadType: 2154, payload: {}}
//export const PROTO_OA_DEPTH_EVENT: ProtoMessages = {payloadType: 2155, payload: {}}
export const PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ: ProtoMessages = {
  payloadType: 2156,
  payload: { ctidTraderAccountId, symbolId: [BTCEUR] }
};
//export const PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES: ProtoMessages = {payloadType: 2157, payload: {}}
export const PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ: ProtoMessages = {
  payloadType: 2158,
  payload: { ctidTraderAccountId, symbolId: [BTCEUR] }
};
//export const PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES: ProtoMessages = {payloadType: 2159, payload: {}}
export const PROTO_OA_SYMBOL_CATEGORY_REQ: ProtoMessages = {
  payloadType: 2160,
  payload: { ctidTraderAccountId }
};
//export const PROTO_OA_SYMBOL_CATEGORY_RES: ProtoMessages = {payloadType: 2161, payload: {}}
export const PROTO_OA_ACCOUNT_LOGOUT_REQ: ProtoMessages = {
  payloadType: 2162,
  payload: { ctidTraderAccountId }
};
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
