import * as $ from "@claasahl/spotware-adapter";

function protoMessage2100(
  payload: $.ProtoOAApplicationAuthReq
): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
    payload
  };
}
function protoMessage2102(payload: $.ProtoOAAccountAuthReq): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
    payload
  };
}
function protoMessage2149(
  payload: $.ProtoOAGetAccountListByAccessTokenReq
): $.ProtoMessages {
  return {
    payloadType: $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
    payload
  };
}

export default {
  pm2100: protoMessage2100,
  applicationAuth: protoMessage2100,

  pm2102: protoMessage2102,
  accountAuth: protoMessage2102,

  pm2149: protoMessage2149,
  getAccountsByAccessToken: protoMessage2149
};
