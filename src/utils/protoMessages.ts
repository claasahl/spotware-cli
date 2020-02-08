import * as $ from "@claasahl/spotware-adapter";

export function pm5(
  payload: $.ProtoMessage,
  clientMsgId?: string
): $.ProtoMessage5 {
  return {
    payloadType: $.ProtoPayloadType.PROTO_MESSAGE,
    payload,
    clientMsgId
  };
}
export function pm50(
  payload: $.ProtoErrorRes,
  clientMsgId?: string
): $.ProtoMessage50 {
  return { payloadType: $.ProtoPayloadType.ERROR_RES, payload, clientMsgId };
}
export function pm51(
  payload: $.ProtoHeartbeatEvent,
  clientMsgId?: string
): $.ProtoMessage51 {
  return {
    payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2100(
  payload: $.ProtoOAApplicationAuthReq,
  clientMsgId?: string
): $.ProtoMessage2100 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
    payload,
    clientMsgId
  };
}
export function pm2101(
  payload: $.ProtoOAApplicationAuthRes,
  clientMsgId?: string
): $.ProtoMessage2101 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES,
    payload,
    clientMsgId
  };
}
export function pm2102(
  payload: $.ProtoOAAccountAuthReq,
  clientMsgId?: string
): $.ProtoMessage2102 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload,
    clientMsgId
  };
}
export function pm2103(
  payload: $.ProtoOAAccountAuthRes,
  clientMsgId?: string
): $.ProtoMessage2103 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES,
    payload,
    clientMsgId
  };
}
export function pm2104(
  payload: $.ProtoOAVersionReq,
  clientMsgId?: string
): $.ProtoMessage2104 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ,
    payload,
    clientMsgId
  };
}
export function pm2105(
  payload: $.ProtoOAVersionRes,
  clientMsgId?: string
): $.ProtoMessage2105 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_VERSION_RES,
    payload,
    clientMsgId
  };
}
export function pm2106(
  payload: $.ProtoOANewOrderReq,
  clientMsgId?: string
): $.ProtoMessage2106 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_NEW_ORDER_REQ,
    payload,
    clientMsgId
  };
}
export function pm2107(
  payload: $.ProtoOATrailingSLChangedEvent,
  clientMsgId?: string
): $.ProtoMessage2107 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_TRAILING_SL_CHANGED_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2108(
  payload: $.ProtoOACancelOrderReq,
  clientMsgId?: string
): $.ProtoMessage2108 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CANCEL_ORDER_REQ,
    payload,
    clientMsgId
  };
}
export function pm2109(
  payload: $.ProtoOAAmendOrderReq,
  clientMsgId?: string
): $.ProtoMessage2109 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_AMEND_ORDER_REQ,
    payload,
    clientMsgId
  };
}
export function pm2110(
  payload: $.ProtoOAAmendPositionSLTPReq,
  clientMsgId?: string
): $.ProtoMessage2110 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_AMEND_POSITION_SLTP_REQ,
    payload,
    clientMsgId
  };
}
export function pm2111(
  payload: $.ProtoOAClosePositionReq,
  clientMsgId?: string
): $.ProtoMessage2111 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CLOSE_POSITION_REQ,
    payload,
    clientMsgId
  };
}
export function pm2112(
  payload: $.ProtoOAAssetListReq,
  clientMsgId?: string
): $.ProtoMessage2112 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2113(
  payload: $.ProtoOAAssetListRes,
  clientMsgId?: string
): $.ProtoMessage2113 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2114(
  payload: $.ProtoOASymbolsListReq,
  clientMsgId?: string
): $.ProtoMessage2114 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2115(
  payload: $.ProtoOASymbolsListRes,
  clientMsgId?: string
): $.ProtoMessage2115 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2116(
  payload: $.ProtoOASymbolByIdReq,
  clientMsgId?: string
): $.ProtoMessage2116 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_REQ,
    payload,
    clientMsgId
  };
}
export function pm2117(
  payload: $.ProtoOASymbolByIdRes,
  clientMsgId?: string
): $.ProtoMessage2117 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_RES,
    payload,
    clientMsgId
  };
}
export function pm2118(
  payload: $.ProtoOASymbolsForConversionReq,
  clientMsgId?: string
): $.ProtoMessage2118 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_REQ,
    payload,
    clientMsgId
  };
}
export function pm2119(
  payload: $.ProtoOASymbolsForConversionRes,
  clientMsgId?: string
): $.ProtoMessage2119 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_FOR_CONVERSION_RES,
    payload,
    clientMsgId
  };
}
export function pm2120(
  payload: $.ProtoOASymbolChangedEvent,
  clientMsgId?: string
): $.ProtoMessage2120 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CHANGED_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2121(
  payload: $.ProtoOATraderReq,
  clientMsgId?: string
): $.ProtoMessage2121 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_TRADER_REQ,
    payload,
    clientMsgId
  };
}
export function pm2122(
  payload: $.ProtoOATraderRes,
  clientMsgId?: string
): $.ProtoMessage2122 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_TRADER_RES,
    payload,
    clientMsgId
  };
}
export function pm2123(
  payload: $.ProtoOATraderUpdatedEvent,
  clientMsgId?: string
): $.ProtoMessage2123 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_TRADER_UPDATE_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2124(
  payload: $.ProtoOAReconcileReq,
  clientMsgId?: string
): $.ProtoMessage2124 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_RECONCILE_REQ,
    payload,
    clientMsgId
  };
}
export function pm2125(
  payload: $.ProtoOAReconcileRes,
  clientMsgId?: string
): $.ProtoMessage2125 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_RECONCILE_RES,
    payload,
    clientMsgId
  };
}
export function pm2126(
  payload: $.ProtoOAExecutionEvent,
  clientMsgId?: string
): $.ProtoMessage2126 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2127(
  payload: $.ProtoOASubscribeSpotsReq,
  clientMsgId?: string
): $.ProtoMessage2127 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
    payload,
    clientMsgId
  };
}
export function pm2128(
  payload: $.ProtoOASubscribeSpotsRes,
  clientMsgId?: string
): $.ProtoMessage2128 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES,
    payload,
    clientMsgId
  };
}
export function pm2129(
  payload: $.ProtoOAUnsubscribeSpotsReq,
  clientMsgId?: string
): $.ProtoMessage2129 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ,
    payload,
    clientMsgId
  };
}
export function pm2130(
  payload: $.ProtoOAUnsubscribeSpotsRes,
  clientMsgId?: string
): $.ProtoMessage2130 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_RES,
    payload,
    clientMsgId
  };
}
export function pm2131(
  payload: $.ProtoOASpotEvent,
  clientMsgId?: string
): $.ProtoMessage2131 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2132(
  payload: $.ProtoOAOrderErrorEvent,
  clientMsgId?: string
): $.ProtoMessage2132 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ORDER_ERROR_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2133(
  payload: $.ProtoOADealListReq,
  clientMsgId?: string
): $.ProtoMessage2133 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2134(
  payload: $.ProtoOADealListRes,
  clientMsgId?: string
): $.ProtoMessage2134 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2135(
  payload: $.ProtoOASubscribeLiveTrendbarReq,
  clientMsgId?: string
): $.ProtoMessage2135 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ,
    payload,
    clientMsgId
  };
}
export function pm2136(
  payload: $.ProtoOAUnsubscribeLiveTrendbarReq,
  clientMsgId?: string
): $.ProtoMessage2136 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_REQ,
    payload,
    clientMsgId
  };
}
export function pm2137(
  payload: $.ProtoOAGetTrendbarsReq,
  clientMsgId?: string
): $.ProtoMessage2137 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ,
    payload,
    clientMsgId
  };
}
export function pm2138(
  payload: $.ProtoOAGetTrendbarsRes,
  clientMsgId?: string
): $.ProtoMessage2138 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
    payload,
    clientMsgId
  };
}
export function pm2139(
  payload: $.ProtoOAExpectedMarginReq,
  clientMsgId?: string
): $.ProtoMessage2139 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ,
    payload,
    clientMsgId
  };
}
export function pm2140(
  payload: $.ProtoOAExpectedMarginRes,
  clientMsgId?: string
): $.ProtoMessage2140 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES,
    payload,
    clientMsgId
  };
}
export function pm2141(
  payload: $.ProtoOAMarginChangedEvent,
  clientMsgId?: string
): $.ProtoMessage2141 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CHANGED_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2142(
  payload: $.ProtoOAErrorRes,
  clientMsgId?: string
): $.ProtoMessage2142 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ERROR_RES,
    payload,
    clientMsgId
  };
}
export function pm2143(
  payload: $.ProtoOACashFlowHistoryListReq,
  clientMsgId?: string
): $.ProtoMessage2143 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2144(
  payload: $.ProtoOACashFlowHistoryListRes,
  clientMsgId?: string
): $.ProtoMessage2144 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2145(
  payload: $.ProtoOAGetTickDataReq,
  clientMsgId?: string
): $.ProtoMessage2145 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
    payload,
    clientMsgId
  };
}
export function pm2146(
  payload: $.ProtoOAGetTickDataRes,
  clientMsgId?: string
): $.ProtoMessage2146 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES,
    payload,
    clientMsgId
  };
}
export function pm2147(
  payload: $.ProtoOAAccountsTokenInvalidatedEvent,
  clientMsgId?: string
): $.ProtoMessage2147 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNTS_TOKEN_INVALIDATED_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2148(
  payload: $.ProtoOAClientDisconnectEvent,
  clientMsgId?: string
): $.ProtoMessage2148 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_CLIENT_DISCONNECT_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2149(
  payload: $.ProtoOAGetAccountListByAccessTokenReq,
  clientMsgId?: string
): $.ProtoMessage2149 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload,
    clientMsgId
  };
}
export function pm2150(
  payload: $.ProtoOAGetAccountListByAccessTokenRes,
  clientMsgId?: string
): $.ProtoMessage2150 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES,
    payload,
    clientMsgId
  };
}
export function pm2151(
  payload: $.ProtoOAGetCtidProfileByTokenReq,
  clientMsgId?: string
): $.ProtoMessage2151 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ,
    payload,
    clientMsgId
  };
}
export function pm2152(
  payload: $.ProtoOAGetCtidProfileByTokenRes,
  clientMsgId?: string
): $.ProtoMessage2152 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES,
    payload,
    clientMsgId
  };
}
export function pm2153(
  payload: $.ProtoOAAssetClassListReq,
  clientMsgId?: string
): $.ProtoMessage2153 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2154(
  payload: $.ProtoOAAssetClassListRes,
  clientMsgId?: string
): $.ProtoMessage2154 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2155(
  payload: $.ProtoOADepthEvent,
  clientMsgId?: string
): $.ProtoMessage2155 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_DEPTH_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2156(
  payload: $.ProtoOASubscribeDepthQuotesReq,
  clientMsgId?: string
): $.ProtoMessage2156 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
    payload,
    clientMsgId
  };
}
export function pm2157(
  payload: $.ProtoOASubscribeDepthQuotesRes,
  clientMsgId?: string
): $.ProtoMessage2157 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES,
    payload,
    clientMsgId
  };
}
export function pm2158(
  payload: $.ProtoOAUnsubscribeDepthQuotesReq,
  clientMsgId?: string
): $.ProtoMessage2158 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_REQ,
    payload,
    clientMsgId
  };
}
export function pm2159(
  payload: $.ProtoOAUnsubscribeDepthQuotesRes,
  clientMsgId?: string
): $.ProtoMessage2159 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_DEPTH_QUOTES_RES,
    payload,
    clientMsgId
  };
}
export function pm2160(
  payload: $.ProtoOASymbolCategoryListReq,
  clientMsgId?: string
): $.ProtoMessage2160 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ,
    payload,
    clientMsgId
  };
}
export function pm2161(
  payload: $.ProtoOASymbolCategoryListRes,
  clientMsgId?: string
): $.ProtoMessage2161 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES,
    payload,
    clientMsgId
  };
}
export function pm2162(
  payload: $.ProtoOAAccountLogoutReq,
  clientMsgId?: string
): $.ProtoMessage2162 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_REQ,
    payload,
    clientMsgId
  };
}
export function pm2163(
  payload: $.ProtoOAAccountLogoutRes,
  clientMsgId?: string
): $.ProtoMessage2163 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_LOGOUT_RES,
    payload,
    clientMsgId
  };
}
export function pm2164(
  payload: $.ProtoOAAccountDisconnectEvent,
  clientMsgId?: string
): $.ProtoMessage2164 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_DISCONNECT_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2165(
  payload: $.ProtoOASubscribeLiveTrendbarRes,
  clientMsgId?: string
): $.ProtoMessage2165 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_RES,
    payload,
    clientMsgId
  };
}
export function pm2166(
  payload: $.ProtoOAUnsubscribeLiveTrendbarRes,
  clientMsgId?: string
): $.ProtoMessage2166 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_LIVE_TRENDBAR_RES,
    payload,
    clientMsgId
  };
}
export function pm2167(
  payload: $.ProtoOAMarginCallListReq,
  clientMsgId?: string
): $.ProtoMessage2167 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_REQ,
    payload,
    clientMsgId
  };
}
export function pm2168(
  payload: $.ProtoOAMarginCallListRes,
  clientMsgId?: string
): $.ProtoMessage2168 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_LIST_RES,
    payload,
    clientMsgId
  };
}
export function pm2169(
  payload: $.ProtoOAMarginCallUpdateReq,
  clientMsgId?: string
): $.ProtoMessage2169 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_REQ,
    payload,
    clientMsgId
  };
}
export function pm2170(
  payload: $.ProtoOAMarginCallUpdateRes,
  clientMsgId?: string
): $.ProtoMessage2170 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_RES,
    payload,
    clientMsgId
  };
}
export function pm2171(
  payload: $.ProtoOAMarginCallUpdateEvent,
  clientMsgId?: string
): $.ProtoMessage2171 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_UPDATE_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2172(
  payload: $.ProtoOAMarginCallTriggerEvent,
  clientMsgId?: string
): $.ProtoMessage2172 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_MARGIN_CALL_TRIGGER_EVENT,
    payload,
    clientMsgId
  };
}
export function pm2173(
  payload: $.ProtoOARefreshTokenReq,
  clientMsgId?: string
): $.ProtoMessage2173 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_REQ,
    payload,
    clientMsgId
  };
}
export function pm2174(
  payload: $.ProtoOARefreshTokenRes,
  clientMsgId?: string
): $.ProtoMessage2174 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_RES,
    payload,
    clientMsgId
  };
}
