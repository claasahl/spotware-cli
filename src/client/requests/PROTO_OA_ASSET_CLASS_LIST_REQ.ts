import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_ASSET_CLASS_LIST_REQ,
  PROTO_OA_ASSET_CLASS_LIST_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_ASSET_CLASS_LIST_REQ,
  PROTO_OA_ASSET_CLASS_LIST_RES
>(
  FACTORY.PROTO_OA_ASSET_CLASS_LIST_REQ,
  ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ,
  ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_RES
);
