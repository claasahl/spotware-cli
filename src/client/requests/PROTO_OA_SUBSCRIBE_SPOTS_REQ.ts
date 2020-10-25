import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  PROTO_OA_SUBSCRIBE_SPOTS_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  PROTO_OA_SUBSCRIBE_SPOTS_RES
>(
  FACTORY.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ,
  ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_RES
);
