import { Messages, SpotwareSocket } from "@claasahl/spotware-adapter";

import { request as PROTO_OA_ACCOUNT_AUTH_REQ } from "./PROTO_OA_ACCOUNT_AUTH_REQ";
import { request as PROTO_OA_APPLICATION_AUTH_REQ } from "./PROTO_OA_APPLICATION_AUTH_REQ";
import { request as PROTO_OA_ASSET_CLASS_LIST_REQ } from "./PROTO_OA_ASSET_CLASS_LIST_REQ";
import { request as PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ } from "./PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ";
import { request as PROTO_OA_SYMBOL_CATEGORY_REQ } from "./PROTO_OA_SYMBOL_CATEGORY_REQ";
import { request as PROTO_OA_TRADER_REQ } from "./PROTO_OA_TRADER_REQ";
import { request as PROTO_OA_VERSION_REQ } from "./PROTO_OA_VERSION_REQ";

export function requests(socket: SpotwareSocket) {
  const requests = [
    PROTO_OA_ACCOUNT_AUTH_REQ(socket),
    PROTO_OA_APPLICATION_AUTH_REQ(socket),
    PROTO_OA_ASSET_CLASS_LIST_REQ(socket),
    PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(socket),
    PROTO_OA_SYMBOL_CATEGORY_REQ(socket),
    PROTO_OA_TRADER_REQ(socket),
    PROTO_OA_VERSION_REQ(socket),
  ];
  return (msg: Messages) => {
    requests.forEach((req) => req(msg));
  };
}
