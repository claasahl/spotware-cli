import * as $ from "@claasahl/spotware-adapter";

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
