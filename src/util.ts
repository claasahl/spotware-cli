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
function protoMessage2106(
  payload: $.ProtoOANewOrderReq,
  clientMsgId?: string
): $.ProtoMessage2106 {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_NEW_ORDER_REQ,
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

function periodToMillis(period: $.ProtoOATrendbarPeriod): number {
  const MIN = 60000;
  switch (period) {
    case $.ProtoOATrendbarPeriod.M1:
      return MIN;
    case $.ProtoOATrendbarPeriod.M2:
      return 2 * MIN;
    case $.ProtoOATrendbarPeriod.M3:
      return 3 * MIN;
    case $.ProtoOATrendbarPeriod.M4:
      return 4 * MIN;
    case $.ProtoOATrendbarPeriod.M5:
      return 5 * MIN;
    case $.ProtoOATrendbarPeriod.M10:
      return 10 * MIN;
    case $.ProtoOATrendbarPeriod.M15:
      return 15 * MIN;
    case $.ProtoOATrendbarPeriod.M30:
      return 30 * MIN;
    case $.ProtoOATrendbarPeriod.H1:
      return 60 * MIN;
    case $.ProtoOATrendbarPeriod.H4:
      return 240 * MIN;
    case $.ProtoOATrendbarPeriod.H12:
      return 720 * MIN;
    case $.ProtoOATrendbarPeriod.D1:
      return 1440 * MIN;
    case $.ProtoOATrendbarPeriod.W1:
      return 10080 * MIN;
    case $.ProtoOATrendbarPeriod.MN1:
      throw new Error("millis for period MN1 is not static/fixed");
    default:
      throw new Error(`unknown period: ${period}`);
  }
}

export default {
  pm51: protoMessage51,
  heartbeat: protoMessage51,

  pm2100: protoMessage2100,
  applicationAuth: protoMessage2100,

  pm2102: protoMessage2102,
  accountAuth: protoMessage2102,

  pm2106: protoMessage2106,
  newOrder: protoMessage2106,

  pm2127: protoMessage2127,
  subscribeSpots: protoMessage2127,

  pm2135: protoMessage2135,
  subscribeTrendbars: protoMessage2135,

  pm2137: protoMessage2137,
  getTrendbars: protoMessage2137,

  pm2145: protoMessage2145,
  getTickdata: protoMessage2145,

  pm2149: protoMessage2149,
  getAccountsByAccessToken: protoMessage2149,

  periodToMillis
};
