// PROTO_OA_APPLICATION_AUTH_REQ = 2100,
// PROTO_OA_APPLICATION_AUTH_RES = 2101,
export { applicationAuth } from "./applicationAuth";

// PROTO_OA_ACCOUNT_AUTH_REQ = 2102,
// PROTO_OA_ACCOUNT_AUTH_RES = 2103,
export { accountAuth } from "./accountAuth";

// PROTO_OA_VERSION_REQ = 2104,
// PROTO_OA_VERSION_RES = 2105,
export { version } from "./version";

// PROTO_OA_NEW_ORDER_REQ = 2106,
export { newOrder } from "./newOrder";

// PROTO_OA_TRAILING_SL_CHANGED_EVENT = 2107,
// XXX

// PROTO_OA_CANCEL_ORDER_REQ = 2108,
export { cancelOrder } from "./cancelOrder";

// PROTO_OA_AMEND_ORDER_REQ = 2109,
export { amendOrder } from "./amendOrder";

// PROTO_OA_AMEND_POSITION_SLTP_REQ = 2110,
export { amendPositionSltp } from "./amendPositionSltp";

// PROTO_OA_CLOSE_POSITION_REQ = 2111,
export { closePosition } from "./closePosition";

// PROTO_OA_ASSET_LIST_REQ = 2112,
// PROTO_OA_ASSET_LIST_RES = 2113,
export { assetList } from "./assetList";

// PROTO_OA_SYMBOLS_LIST_REQ = 2114,
// PROTO_OA_SYMBOLS_LIST_RES = 2115,
export { symbolsList } from "./symbolsList";

// PROTO_OA_SYMBOL_BY_ID_REQ = 2116,
// PROTO_OA_SYMBOL_BY_ID_RES = 2117,
export { symbolById } from "./symbolById";

// PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ = 2118,
// PROTO_OA_SYMBOLS_FOR_CONVERSION_RES = 2119,
export { symbolsForConversion } from "./symbolsForConversion";

// PROTO_OA_SYMBOL_CHANGED_EVENT = 2120,
// XXX

// PROTO_OA_TRADER_REQ = 2121,
// PROTO_OA_TRADER_RES = 2122,
export { trader } from "./trader";

// PROTO_OA_TRADER_UPDATE_EVENT = 2123,
// XXX

// PROTO_OA_RECONCILE_REQ = 2124,
// PROTO_OA_RECONCILE_RES = 2125,
export { reconcile } from "./reconcile";

// PROTO_OA_EXECUTION_EVENT = 2126,
// XXX

// PROTO_OA_SUBSCRIBE_SPOTS_REQ = 2127,
// PROTO_OA_SUBSCRIBE_SPOTS_RES = 2128,
export { subscribeSpots } from "./subscribeSpots";

// PROTO_OA_UNSUBSCRIBE_SPOTS_REQ = 2129,
// PROTO_OA_UNSUBSCRIBE_SPOTS_RES = 2130,
export { unsubscribeSpots } from "./unsubscribeSpots";

// PROTO_OA_SPOT_EVENT = 2131,
// XXX

// PROTO_OA_ORDER_ERROR_EVENT = 2132,
// XXX

// PROTO_OA_DEAL_LIST_REQ = 2133,
// PROTO_OA_DEAL_LIST_RES = 2134,
export { dealList } from "./dealList";

// PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ = 2135,
export { subscribeLiveTrendbar } from "./subscribeLiveTrendbar";

// PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ = 2136,
export { unsubscribeLiveTrendbar } from "./unsubscribeLiveTrendbar";

// PROTO_OA_GET_TRENDBARS_REQ = 2137,
// PROTO_OA_GET_TRENDBARS_RES = 2138,
export { getTrendbars } from "./getTrendbars";

// PROTO_OA_EXPECTED_MARGIN_REQ = 2139,
// PROTO_OA_EXPECTED_MARGIN_RES = 2140,
export { expectedMargin } from "./expectedMargin";

// PROTO_OA_MARGIN_CHANGED_EVENT = 2141,
// XXX

// PROTO_OA_ERROR_RES = 2142,
// XXX

// PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ = 2143,
// PROTO_OA_CASH_FLOW_HISTORY_LIST_RES = 2144,
export { cashFlowHistoryList } from "./cashFlowHistoryList";

// PROTO_OA_GET_TICKDATA_REQ = 2145,
// PROTO_OA_GET_TICKDATA_RES = 2146,
export { getTickdata } from "./getTickdata";

// PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT = 2147,
// XXX

// PROTO_OA_CLIENT_DISCONNECT_EVENT = 2148,
// XXX

// PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ = 2149,
// PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES = 2150,
export { getAccountsByAccessToken } from "./getAccountsByAccessToken";

// PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ = 2151,
// PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES = 2152,
export { getCtidProfileByToken } from "./getCtidProfileByToken";

// PROTO_OA_ASSET_CLASS_LIST_REQ = 2153,
// PROTO_OA_ASSET_CLASS_LIST_RES = 2154,
export { assetClassList } from "./assetClassList";

// PROTO_OA_DEPTH_EVENT = 2155,
// XXX

// PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ = 2156,
// PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES = 2157,
export { subscribeDepthQuotes } from "./subscribeDepthQuotes";

// PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ = 2158,
// PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES = 2159,
export { unsubscribeDepthQuotes } from "./unsubscribeDepthQuotes";

// PROTO_OA_SYMBOL_CATEGORY_REQ = 2160,
// PROTO_OA_SYMBOL_CATEGORY_RES = 2161,
export { symbolCategory } from "./symbolCategory";

// PROTO_OA_ACCOUNT_LOGOUT_REQ = 2162,
// PROTO_OA_ACCOUNT_LOGOUT_RES = 2163,
export { accountLogout } from "./accountLogout";

// PROTO_OA_ACCOUNT_DISCONNECT_EVENT = 2164,
// XXX

// PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES = 2165,
// PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES = 2166,

// PROTO_OA_MARGIN_CALL_LIST_REQ = 2167,
// PROTO_OA_MARGIN_CALL_LIST_RES = 2168,
export { marginCallList } from "./marginCallList";

// PROTO_OA_MARGIN_CALL_UPDATE_REQ = 2169,
// PROTO_OA_MARGIN_CALL_UPDATE_RES = 2170,
export { marginCallUpdate } from "./marginCallUpdate";

// PROTO_OA_MARGIN_CALL_UPDATE_EVENT = 2171,
// XXX

// PROTO_OA_MARGIN_CALL_TRIGGER_EVENT = 2172
// XXX
