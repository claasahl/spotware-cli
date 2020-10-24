import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
  PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES
>(
  FACTORY.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
  ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_REQ,
  ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_DEPTH_QUOTES_RES
);