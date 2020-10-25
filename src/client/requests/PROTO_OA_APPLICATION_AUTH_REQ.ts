import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_APPLICATION_AUTH_REQ,
  PROTO_OA_APPLICATION_AUTH_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_APPLICATION_AUTH_REQ,
  PROTO_OA_APPLICATION_AUTH_RES
>(
  FACTORY.PROTO_OA_APPLICATION_AUTH_REQ,
  ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
  ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES
);
