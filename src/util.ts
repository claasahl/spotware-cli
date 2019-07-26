import * as $ from "@claasahl/spotware-adapter";

function protoMessage51(
  payload: $.ProtoHeartbeatEvent,
  clientMsgId?: string
): $.ProtoMessages {
  return {
    payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT,
    payload,
    clientMsgId
  };
}
function protoMessage2100(
  payload: $.ProtoOAApplicationAuthReq,
  clientMsgId?: string
): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2102(
  payload: $.ProtoOAAccountAuthReq,
  clientMsgId?: string
): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2145(
  payload: $.ProtoOAGetTickDataReq,
  clientMsgId?: string
): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
    payload,
    clientMsgId
  };
}
function protoMessage2149(
  payload: $.ProtoOAGetAccountListByAccessTokenReq,
  clientMsgId?: string
): $.ProtoMessages {
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

  pm2145: protoMessage2145,
  getTickdata: protoMessage2145,

  pm2149: protoMessage2149,
  getAccountsByAccessToken: protoMessage2149
};
