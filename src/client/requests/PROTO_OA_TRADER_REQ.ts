import { FACTORY, ProtoOAPayloadType } from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest(
  FACTORY.PROTO_OA_TRADER_REQ,
  ProtoOAPayloadType.PROTO_OA_TRADER_REQ,
  ProtoOAPayloadType.PROTO_OA_TRADER_RES
);
