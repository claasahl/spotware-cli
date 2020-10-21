import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_RECONCILE_REQ,
  PROTO_OA_RECONCILE_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<PROTO_OA_RECONCILE_REQ, PROTO_OA_RECONCILE_RES>(
  FACTORY.PROTO_OA_RECONCILE_REQ,
  ProtoOAPayloadType.PROTO_OA_RECONCILE_REQ,
  ProtoOAPayloadType.PROTO_OA_RECONCILE_RES
);
