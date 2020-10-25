import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_TRADER_REQ,
  PROTO_OA_TRADER_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<PROTO_OA_TRADER_REQ, PROTO_OA_TRADER_RES>(
  FACTORY.PROTO_OA_TRADER_REQ,
  ProtoOAPayloadType.PROTO_OA_TRADER_REQ,
  ProtoOAPayloadType.PROTO_OA_TRADER_RES
);
