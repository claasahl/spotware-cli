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
