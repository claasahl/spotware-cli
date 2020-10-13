import {
  PROTO_OA_ACCOUNT_AUTH_REQ,
  PROTO_OA_APPLICATION_AUTH_REQ,
  PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

import * as R from "../requests";

export interface Options {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

export interface Result {}

export function macro(
  socket: SpotwareClientSocket,
  options: Options,
  cb: (
    error: Error | undefined | null,
    result: Result | undefined | null,
    options: Options
  ) => void
): void {
  const { clientId, clientSecret, accessToken } = options;
  function PROTO_OA_ACCOUNT_AUTH_REQ(
    req: PROTO_OA_ACCOUNT_AUTH_REQ["payload"]
  ) {
    R.PROTO_OA_ACCOUNT_AUTH_REQ(socket, req, (err, result) => {
      if (err) {
        cb(err, null, options);
      } else {
        PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ({ accessToken });
      }
    });
  }
  function PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(
    req: PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ["payload"]
  ) {
    R.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ(socket, req, (err, result) => {
      if (err) {
        cb(err, null, options);
      } else {
        PROTO_OA_ACCOUNT_AUTH_REQ({
          accessToken: req.accessToken,
          ctidTraderAccountId: result,
        });
      }
    });
  }
  function PROTO_OA_APPLICATION_AUTH_REQ(
    req: PROTO_OA_APPLICATION_AUTH_REQ["payload"]
  ) {
    R.PROTO_OA_APPLICATION_AUTH_REQ(socket, req, (err, _result) => {
      if (err) {
        cb(err, null, options);
      } else {
        PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ({ accessToken });
      }
    });
  }

  PROTO_OA_APPLICATION_AUTH_REQ({ clientId, clientSecret });
}
