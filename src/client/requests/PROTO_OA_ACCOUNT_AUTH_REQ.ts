import { FACTORY, ProtoOAPayloadType } from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest(
  FACTORY.PROTO_OA_ACCOUNT_AUTH_REQ,
  ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ,
  ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES
);
