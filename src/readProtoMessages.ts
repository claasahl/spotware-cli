import tls from "tls";
import Pbf from "pbf";

import * as $$ from "./OpenApiCommonMessages";
import * as $ from "./OpenApiMessages";

export default function readProtoMessage(
  socket: tls.TLSSocket,
  message: $$.ProtoMessage
): void {
  const msg: {
    clientMsgId?: string;
    payloadType: number;
    payload: any;
  } = {
    clientMsgId: message.clientMsgId,
    payloadType: message.payloadType,
    payload: message.payload
  };
  switch (message.payloadType) {
    case $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ:
      msg.payload = $.ProtoOAVersionReqUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_VERSION_RES:
      msg.payload = $.ProtoOAVersionResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ERROR_RES:
      msg.payload = $.ProtoOAErrorResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ:
      msg.payload = $.ProtoOAApplicationAuthReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES:
      msg.payload = $.ProtoOAApplicationAuthResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ:
      msg.payload = $.ProtoOAGetAccountListByAccessTokenReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES:
      msg.payload = $.ProtoOAGetAccountListByAccessTokenResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ:
      msg.payload = $.ProtoOAGetCtidProfileByTokenReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES:
      msg.payload = $.ProtoOAGetCtidProfileByTokenResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ:
      msg.payload = $.ProtoOAAccountAuthReqUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES:
      msg.payload = $.ProtoOAAccountAuthResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ:
      msg.payload = $.ProtoOASymbolsListReqUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES:
      msg.payload = $.ProtoOASymbolsListResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ:
      msg.payload = $.ProtoOASubscribeSpotsReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES:
      msg.payload = $.ProtoOASubscribeSpotsResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ:
      msg.payload = $.ProtoOASymbolCategoryListReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES:
      msg.payload = $.ProtoOASymbolCategoryListResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ:
      msg.payload = $.ProtoOAAssetListReqUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES:
      msg.payload = $.ProtoOAAssetListResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ:
      msg.payload = $.ProtoOAAssetClassListReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES:
      msg.payload = $.ProtoOAAssetClassListResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ:
      msg.payload = $.ProtoOAExpectedMarginReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES:
      msg.payload = $.ProtoOAExpectedMarginResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ:
      msg.payload = $.ProtoOADealListReqUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES:
      msg.payload = $.ProtoOADealListResUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ:
      msg.payload = $.ProtoOACashFlowHistoryListReqUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_RES:
      msg.payload = $.ProtoOACashFlowHistoryListResUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT:
      msg.payload = $.ProtoOAExecutionEventUtils.read(new Pbf(message.payload));
      break;
    case $.ProtoOAPayloadType.PROTO_OA_TRAILING_SL_CHANGED_EVENT:
      msg.payload = $.ProtoOATrailingSLChangedEventUtils.read(
        new Pbf(message.payload)
      );
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
      msg.payload = $.ProtoOASpotEventUtils.read(new Pbf(message.payload));
      break;
    case $$.ProtoPayloadType.HEARTBEAT_EVENT:
      msg.payload = $$.ProtoHeartbeatEventUtils.read(new Pbf(message.payload));
      break;
  }
  socket.emit("PROTO_MESSAGE.*", msg);
  socket.emit(`PROTO_MESSAGE.${message.payloadType}`, msg);
}
