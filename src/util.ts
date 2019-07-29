import * as $ from "@claasahl/spotware-adapter";

function protoMessage51(
  payload: $.ProtoHeartbeatEvent,
  clientMsgId?: string
): $.ProtoMessage51 {
  return {
    payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT,
    payload,
    clientMsgId
  };
}
function protoMessage2100(
  payload: $.ProtoOAApplicationAuthReq,
  clientMsgId?: string
): $.ProtoMessage2100 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2102(
  payload: $.ProtoOAAccountAuthReq,
  clientMsgId?: string
): $.ProtoMessage2102 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2127(
  payload: $.ProtoOASubscribeSpotsReq,
  clientMsgId?: string
): $.ProtoMessage2127 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2135(
  payload: $.ProtoOASubscribeLiveTrendbarReq,
  clientMsgId?: string
): $.ProtoMessage2135 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_LIVE_TRENDBAR_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2137(
  payload: $.ProtoOAGetTrendbarsReq,
  clientMsgId?: string
): $.ProtoMessage2137 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2145(
  payload: $.ProtoOAGetTickDataReq,
  clientMsgId?: string
): $.ProtoMessage2145 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2149(
  payload: $.ProtoOAGetAccountListByAccessTokenReq,
  clientMsgId?: string
): $.ProtoMessage2149 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload,
    clientMsgId
  };
}

export default {
  pm51: protoMessage51,
  heartbeat: protoMessage51,

  pm2100: protoMessage2100,
  applicationAuth: protoMessage2100,

  pm2102: protoMessage2102,
  accountAuth: protoMessage2102,

  pm2127: protoMessage2127,
  subscribeSpots: protoMessage2127,

  pm2135: protoMessage2135,
  subscribeTrendbars: protoMessage2135,

  pm2137: protoMessage2137,
  getTrendbars: protoMessage2137,

  pm2145: protoMessage2145,
  getTickdata: protoMessage2145,

  pm2149: protoMessage2149,
  getAccountsByAccessToken: protoMessage2149
};
