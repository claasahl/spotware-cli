import Pbf from "pbf";

import * as $$ from "./OpenApiCommonMessages";
import * as $ from "./OpenApiMessages";

export default function writeProtoMessages(message: any): Uint8Array {
  const pbf = new Pbf();
  switch (message.payloadType) {
    case $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ:
      $.ProtoOAVersionReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_VERSION_RES:
      $.ProtoOAVersionResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ERROR_RES:
      $.ProtoOAErrorResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ:
      $.ProtoOAApplicationAuthReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES:
      $.ProtoOAApplicationAuthResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ:
      $.ProtoOAGetAccountListByAccessTokenReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES:
      $.ProtoOAGetAccountListByAccessTokenResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_REQ:
      $.ProtoOAGetCtidProfileByTokenReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_GET_CTID_PROFILE_BY_TOKEN_RES:
      $.ProtoOAGetCtidProfileByTokenResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ:
      $.ProtoOAAccountAuthReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES:
      $.ProtoOAAccountAuthResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ:
      $.ProtoOASymbolsListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES:
      $.ProtoOASymbolsListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ:
      $.ProtoOASubscribeSpotsReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES:
      $.ProtoOASubscribeSpotsResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ:
      $.ProtoOASymbolCategoryListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES:
      $.ProtoOASymbolCategoryListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_REQ:
      $.ProtoOAAssetListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_LIST_RES:
      $.ProtoOAAssetListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ:
      $.ProtoOAAssetClassListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES:
      $.ProtoOAAssetClassListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_REQ:
      $.ProtoOAExpectedMarginReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXPECTED_MARGIN_RES:
      $.ProtoOAExpectedMarginResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_REQ:
      $.ProtoOADealListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_DEAL_LIST_RES:
      $.ProtoOADealListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ:
      $.ProtoOACashFlowHistoryListReqUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_CASH_FLOW_HISTORY_LIST_REQ:
      $.ProtoOACashFlowHistoryListResUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_TRAILING_SL_CHANGED_EVENT:
      $.ProtoOATrailingSLChangedEventUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT:
      $.ProtoOAExecutionEventUtils.write(message.payload, pbf);
      break;
    case $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
      $.ProtoOASpotEventUtils.write(message.payload, pbf);
      break;
    case $$.ProtoPayloadType.HEARTBEAT_EVENT:
      $$.ProtoHeartbeatEventUtils.write(message.payload, pbf);
      break;
  }
  return pbf.finish();
}
