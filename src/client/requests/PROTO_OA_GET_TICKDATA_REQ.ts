import {
  FACTORY,
  ProtoOAPayloadType,
  PROTO_OA_GET_TICKDATA_REQ,
  PROTO_OA_GET_TICKDATA_RES,
} from "@claasahl/spotware-adapter";

import { behest } from "./utils";

export const request = behest<
  PROTO_OA_GET_TICKDATA_REQ,
  PROTO_OA_GET_TICKDATA_RES
>(
  FACTORY.PROTO_OA_GET_TICKDATA_REQ,
  ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ,
  ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES
);
