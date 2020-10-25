import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_SYMBOL_CATEGORY_REQ,
  PROTO_OA_SYMBOL_CATEGORY_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_SYMBOL_CATEGORY_REQ,
  PROTO_OA_SYMBOL_CATEGORY_RES
>(
  FACTORY.PROTO_OA_SYMBOL_CATEGORY_REQ,
  ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ,
  ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_RES
);
