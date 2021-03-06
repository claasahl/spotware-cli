import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_REFRESH_TOKEN_REQ,
  PROTO_OA_REFRESH_TOKEN_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_REFRESH_TOKEN_REQ,
  PROTO_OA_REFRESH_TOKEN_RES
>(
  FACTORY.PROTO_OA_REFRESH_TOKEN_REQ,
  ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_REQ,
  ProtoOAPayloadType.PROTO_OA_REFRESH_TOKEN_RES
);
