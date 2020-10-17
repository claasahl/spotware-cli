import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_NEW_ORDER_REQ,
  PROTO_OA_EXECUTION_EVENT,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<PROTO_OA_NEW_ORDER_REQ, PROTO_OA_EXECUTION_EVENT>(
  FACTORY.PROTO_OA_NEW_ORDER_REQ,
  ProtoOAPayloadType.PROTO_OA_NEW_ORDER_REQ,
  ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT
);
