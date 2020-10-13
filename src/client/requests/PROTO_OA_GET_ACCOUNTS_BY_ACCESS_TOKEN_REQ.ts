import { FACTORY, ProtoOAPayloadType } from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest(
  FACTORY.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
  ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
  ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES
);
