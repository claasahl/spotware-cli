import { FACTORY, ProtoOAPayloadType } from "@claasahl/spotware-adapter";

import { behest } from "./utils";

// this does not work for all requests. the result for some requests might change over time (i.e. auth account... account can get "kicked" out)

export const request = behest(
  FACTORY.PROTO_OA_VERSION_REQ,
  ProtoOAPayloadType.PROTO_OA_VERSION_REQ,
  ProtoOAPayloadType.PROTO_OA_VERSION_RES
);
